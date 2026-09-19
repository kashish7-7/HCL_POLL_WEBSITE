package repository

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"backend/internal/database"
	"backend/internal/models"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PollRepository struct {
	db    *mongo.Database
	redis *redis.Client
}

func NewPollRepository(mongoInst *database.MongoInstance, redisInst *database.RedisInstance) *PollRepository {
	var rClient *redis.Client
	if redisInst != nil {
		rClient = redisInst.Client
	}
	return &PollRepository{
		db:    mongoInst.DB,
		redis: rClient,
	}
}

func (r *PollRepository) CreatePoll(ctx context.Context, input models.CreatePollInput, ownerID primitive.ObjectID, ownerName string) (*models.Poll, error) {
	pollsColl := r.db.Collection("polls")

	pollID := primitive.NewObjectID()
	var opts []models.Option
	redisCountMap := make(map[string]interface{})

	for i, optText := range input.Options {
		optID := fmt.Sprintf("opt_%d", i+1)
		opts = append(opts, models.Option{
			ID:   optID,
			Text: optText,
		})
		redisCountMap[optID] = "0"
	}

	poll := models.Poll{
		ID:        pollID,
		OwnerID:   ownerID,
		OwnerName: ownerName,
		Question:  input.Question,
		Options:   opts,
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	// 1. Save Poll to MongoDB
	_, err := pollsColl.InsertOne(ctx, poll)
	if err != nil {
		return nil, fmt.Errorf("failed to save poll to MongoDB: %w", err)
	}

	// 2. Initialize Redis Hash for option counts
	if r.redis != nil {
		redisKey := fmt.Sprintf("poll:%s:counts", pollID.Hex())
		err := r.redis.HSet(ctx, redisKey, redisCountMap).Err()
		if err != nil {
			fmt.Printf("Warning: failed to initialize Redis poll counts: %v\n", err)
		}
	}

	return &poll, nil
}

func (r *PollRepository) GetPollByID(ctx context.Context, pollIDStr string) (*models.Poll, error) {
	pollID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return nil, errors.New("invalid poll ID format")
	}

	pollsColl := r.db.Collection("polls")
	var poll models.Poll
	err = pollsColl.FindOne(ctx, bson.M{"_id": pollID}).Decode(&poll)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("poll not found")
		}
		return nil, err
	}

	return &poll, nil
}

func (r *PollRepository) GetPollResults(ctx context.Context, pollIDStr string) (*models.PollResultPayload, error) {
	poll, err := r.GetPollByID(ctx, pollIDStr)
	if err != nil {
		return nil, err
	}

	countsMap := make(map[string]int64)
	var totalVotes int64 = 0

	// Read Redis atomic counters
	if r.redis != nil {
		redisKey := fmt.Sprintf("poll:%s:counts", pollIDStr)
		redisCounts, err := r.redis.HGetAll(ctx, redisKey).Result()
		if err == nil {
			for k, v := range redisCounts {
				if count, err := strconv.ParseInt(v, 10, 64); err == nil {
					countsMap[k] = count
					totalVotes += count
				}
			}
		}
	}

	var optionResults []models.OptionResult
	for _, opt := range poll.Options {
		votes := countsMap[opt.ID]
		var percentage float64 = 0
		if totalVotes > 0 {
			percentage = (float64(votes) / float64(totalVotes)) * 100.0
		}
		optionResults = append(optionResults, models.OptionResult{
			ID:         opt.ID,
			Text:       opt.Text,
			Votes:      votes,
			Percentage: percentage,
		})
	}

	return &models.PollResultPayload{
		PollID:     pollIDStr,
		Question:   poll.Question,
		IsActive:   poll.IsActive,
		TotalVotes: totalVotes,
		Counts:     countsMap,
		Options:    optionResults,
	}, nil
}

func (r *PollRepository) CastVote(ctx context.Context, pollIDStr string, optionID string, voterUUID string, ipAddress string) (*models.RealtimeBroadcastEvent, error) {
	pollID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return nil, errors.New("invalid poll ID format")
	}

	poll, err := r.GetPollByID(ctx, pollIDStr)
	if err != nil {
		return nil, err
	}

	if !poll.IsActive {
		return nil, errors.New("this poll is closed and no longer accepting votes")
	}

	// Validate option exists
	validOpt := false
	for _, o := range poll.Options {
		if o.ID == optionID {
			validOpt = true
			break
		}
	}
	if !validOpt {
		return nil, errors.New("invalid option selected")
	}

	// Build voter fingerprint combining UUID & poll ID
	voterHashRaw := fmt.Sprintf("%s:%s", pollIDStr, voterUUID)
	hasher := sha256.New()
	hasher.Write([]byte(voterHashRaw))
	voterHash := hex.EncodeToString(hasher.Sum(nil))

	// 1. Redis Set Deduplication check
	if r.redis != nil {
		voterSetKey := fmt.Sprintf("poll:%s:voters", pollIDStr)
		added, err := r.redis.SAdd(ctx, voterSetKey, voterHash).Result()
		if err == nil && added == 0 {
			return nil, errors.New("you have already voted on this poll")
		}
	}

	// 2. Atomic Redis Counter HINCRBY
	countsMap := make(map[string]int64)
	var totalVotes int64 = 0

	redisKey := fmt.Sprintf("poll:%s:counts", pollIDStr)
	if r.redis != nil {
		_, _ = r.redis.HIncrBy(ctx, redisKey, optionID, 1).Result()
		allCounts, err := r.redis.HGetAll(ctx, redisKey).Result()
		if err == nil {
			for k, v := range allCounts {
				if val, err := strconv.ParseInt(v, 10, 64); err == nil {
					countsMap[k] = val
					totalVotes += val
				}
			}
		}
	} else {
		countsMap[optionID] = 1
		totalVotes = 1
	}

	// 3. Publish update event to Redis Pub/Sub channel
	broadcast := models.RealtimeBroadcastEvent{
		PollID:     pollIDStr,
		OptionID:   optionID,
		Counts:     countsMap,
		TotalVotes: totalVotes,
		Timestamp:  time.Now().UnixMilli(),
	}

	if r.redis != nil {
		payloadBytes, _ := json.Marshal(broadcast)
		channel := fmt.Sprintf("poll:%s:updates", pollIDStr)
		_ = r.redis.Publish(ctx, channel, payloadBytes).Err()
	}

	// 4. Async MongoDB persistent audit write
	go func() {
		bgCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		votesColl := r.db.Collection("votes")
		_, _ = votesColl.InsertOne(bgCtx, models.Vote{
			ID:              primitive.NewObjectID(),
			PollID:          pollID,
			OptionID:        optionID,
			VoterIdentifier: voterHash,
			IPAddress:       ipAddress,
			CreatedAt:       time.Now(),
		})
	}()

	return &broadcast, nil
}

func (r *PollRepository) ClosePoll(ctx context.Context, pollIDStr string, ownerID primitive.ObjectID) error {
	pollID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return errors.New("invalid poll ID format")
	}

	pollsColl := r.db.Collection("polls")
	res, err := pollsColl.UpdateOne(ctx, bson.M{"_id": pollID, "owner_id": ownerID}, bson.M{"$set": bson.M{"is_active": false}})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("poll not found or unauthorized")
	}
	return nil
}

func (r *PollRepository) GetUserPolls(ctx context.Context, ownerID primitive.ObjectID) ([]models.PollResultPayload, error) {
	pollsColl := r.db.Collection("polls")

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := pollsColl.Find(ctx, bson.M{"owner_id": ownerID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err := cursor.All(ctx, &polls); err != nil {
		return nil, err
	}

	var results []models.PollResultPayload
	for _, p := range polls {
		res, err := r.GetPollResults(ctx, p.ID.Hex())
		if err == nil {
			results = append(results, *res)
		}
	}

	return results, nil
}

func (r *PollRepository) DeletePoll(ctx context.Context, pollIDStr string, ownerID primitive.ObjectID) error {
	pollID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return errors.New("invalid poll ID format")
	}

	pollsColl := r.db.Collection("polls")
	res, err := pollsColl.DeleteOne(ctx, bson.M{"_id": pollID, "owner_id": ownerID})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("poll not found or unauthorized")
	}

	// Clean up Redis keys
	if r.redis != nil {
		_ = r.redis.Del(ctx, fmt.Sprintf("poll:%s:counts", pollIDStr)).Err()
		_ = r.redis.Del(ctx, fmt.Sprintf("poll:%s:voters", pollIDStr)).Err()
	}

	return nil
}
