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
	return &PollRepository{
		db:    mongoInst.DB,
		redis: redisInst.Client,
	}
}

func (r *PollRepository) CreatePoll(ctx context.Context, input models.CreatePollInput, creatorID primitive.ObjectID, creatorName string) (*models.Poll, error) {
	pollsColl := r.db.Collection("polls")

	pollID := primitive.NewObjectID()
	var opts []models.Option
	redisCountMap := make(map[string]interface{})

	for i, optText := range input.Options {
		optID := fmt.Sprintf("opt_%d", i+1)
		opts = append(opts, models.Option{
			ID:    optID,
			Text:  optText,
			Votes: 0,
		})
		redisCountMap[optID] = "0"
	}

	var expiresAt *time.Time
	if input.ExpirationMinutes != nil && *input.ExpirationMinutes > 0 {
		t := time.Now().Add(time.Duration(*input.ExpirationMinutes) * time.Minute)
		expiresAt = &t
	}

	category := input.Category
	if category == "" {
		category = "General"
	}

	poll := models.Poll{
		ID:            pollID,
		Title:         input.Title,
		Description:   input.Description,
		Category:      category,
		CreatorID:     creatorID,
		CreatorName:   creatorName,
		Options:       opts,
		IsActive:      true,
		AllowMultiple: input.AllowMultiple,
		ExpiresAt:     expiresAt,
		CreatedAt:     time.Now(),
		TotalVotes:    0,
	}

	// 1. Insert into MongoDB
	_, err := pollsColl.InsertOne(ctx, poll)
	if err != nil {
		return nil, fmt.Errorf("failed to save poll to MongoDB: %w", err)
	}

	// 2. Initialize Redis Hash for live counts
	redisKey := fmt.Sprintf("poll:counts:%s", pollID.Hex())
	if r.redis != nil {
		err := r.redis.HSet(ctx, redisKey, redisCountMap).Err()
		if err != nil {
			// Log error but don't fail as Mongo insertion succeeded
			fmt.Printf("Warning: failed to seed Redis poll counts: %v\n", err)
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

	// Enrich option vote counts with real-time Redis data
	if r.redis != nil {
		redisKey := fmt.Sprintf("poll:counts:%s", pollIDStr)
		redisCounts, err := r.redis.HGetAll(ctx, redisKey).Result()
		if err == nil && len(redisCounts) > 0 {
			var total int64 = 0
			for i, opt := range poll.Options {
				if countStr, ok := redisCounts[opt.ID]; ok {
					if count, err := strconv.ParseInt(countStr, 10, 64); err == nil {
						poll.Options[i].Votes = count
						total += count
					}
				}
			}
			poll.TotalVotes = total
		}
	}

	return &poll, nil
}

func (r *PollRepository) CastVote(ctx context.Context, pollIDStr string, optionID string, voterIP string, voterIdentifier string) (*models.VoteBroadcastPayload, error) {
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

	if poll.ExpiresAt != nil && time.Now().After(*poll.ExpiresAt) {
		return nil, errors.New("this poll has expired")
	}

	// Verify Option ID exists
	validOption := false
	for _, opt := range poll.Options {
		if opt.ID == optionID {
			validOption = true
			break
		}
	}
	if !validOption {
		return nil, errors.New("invalid option selected")
	}

	// 1. Create voter fingerprint for deduplication
	voterHashRaw := fmt.Sprintf("%s:%s:%s", pollIDStr, voterIP, voterIdentifier)
	hasher := sha256.New()
	hasher.Write([]byte(voterHashRaw))
	voterHash := hex.EncodeToString(hasher.Sum(nil))

	// Check deduplication in Redis Set
	voterSetKey := fmt.Sprintf("poll:voters:%s", pollIDStr)
	if r.redis != nil {
		added, err := r.redis.SAdd(ctx, voterSetKey, voterHash).Result()
		if err == nil && added == 0 {
			return nil, errors.New("you have already cast your vote in this poll")
		}
	}

	// 2. Increment atomic Redis Hash counter
	countsMap := make(map[string]int64)
	var totalVotes int64 = 0

	redisKey := fmt.Sprintf("poll:counts:%s", pollIDStr)
	if r.redis != nil {
		newVal, err := r.redis.HIncrBy(ctx, redisKey, optionID, 1).Result()
		if err != nil {
			return nil, fmt.Errorf("redis vote increment failed: %w", err)
		}
		_ = newVal

		// Fetch all current counts from Redis Hash
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
		// Fallback if Redis is down
		countsMap[optionID] = 1
		totalVotes = 1
	}

	// 3. Prepare payload & publish to Redis Pub/Sub channel
	payload := models.VoteBroadcastPayload{
		PollID:     pollIDStr,
		OptionID:   optionID,
		Counts:     countsMap,
		TotalVotes: totalVotes,
		Timestamp:  time.Now().UnixMilli(),
	}

	payloadBytes, _ := json.Marshal(payload)
	pubSubChannel := fmt.Sprintf("poll:channel:%s", pollIDStr)

	if r.redis != nil {
		err := r.redis.Publish(ctx, pubSubChannel, payloadBytes).Err()
		if err != nil {
			fmt.Printf("Warning: Redis PubSub publish failed: %v\n", err)
		}
	}

	// 4. Async update MongoDB for permanent storage & audit trail
	go func() {
		bgCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Save vote document
		votesColl := r.db.Collection("votes")
		_, _ = votesColl.InsertOne(bgCtx, models.Vote{
			ID:        primitive.NewObjectID(),
			PollID:    pollID,
			OptionID:  optionID,
			VoterHash: voterHash,
			IPAddress: voterIP,
			CreatedAt: time.Now(),
		})

		// Increment poll total_votes & specific option count in Mongo
		pollsColl := r.db.Collection("polls")
		filter := bson.M{"_id": pollID, "options.id": optionID}
		update := bson.M{
			"$inc": bson.M{
				"total_votes":      1,
				"options.$.votes": 1,
			},
		}
		_, _ = pollsColl.UpdateOne(bgCtx, filter, update)
	}()

	return &payload, nil
}

func (r *PollRepository) GetPublicPolls(ctx context.Context, limit int) ([]models.Poll, error) {
	pollsColl := r.db.Collection("polls")

	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetLimit(int64(limit))

	cursor, err := pollsColl.Find(ctx, bson.M{"is_active": true}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err := cursor.All(ctx, &polls); err != nil {
		return nil, err
	}

	// Enrich with live Redis totals
	for pIdx, poll := range polls {
		if r.redis != nil {
			redisKey := fmt.Sprintf("poll:counts:%s", poll.ID.Hex())
			redisCounts, err := r.redis.HGetAll(ctx, redisKey).Result()
			if err == nil && len(redisCounts) > 0 {
				var total int64 = 0
				for oIdx, opt := range poll.Options {
					if countStr, ok := redisCounts[opt.ID]; ok {
						if count, err := strconv.ParseInt(countStr, 10, 64); err == nil {
							polls[pIdx].Options[oIdx].Votes = count
							total += count
						}
					}
				}
				polls[pIdx].TotalVotes = total
			}
		}
	}

	return polls, nil
}

func (r *PollRepository) GetUserPolls(ctx context.Context, creatorID primitive.ObjectID) ([]models.Poll, error) {
	pollsColl := r.db.Collection("polls")

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := pollsColl.Find(ctx, bson.M{"creator_id": creatorID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err := cursor.All(ctx, &polls); err != nil {
		return nil, err
	}

	for pIdx, poll := range polls {
		if r.redis != nil {
			redisKey := fmt.Sprintf("poll:counts:%s", poll.ID.Hex())
			redisCounts, err := r.redis.HGetAll(ctx, redisKey).Result()
			if err == nil && len(redisCounts) > 0 {
				var total int64 = 0
				for oIdx, opt := range poll.Options {
					if countStr, ok := redisCounts[opt.ID]; ok {
						if count, err := strconv.ParseInt(countStr, 10, 64); err == nil {
							polls[pIdx].Options[oIdx].Votes = count
							total += count
						}
					}
				}
				polls[pIdx].TotalVotes = total
			}
		}
	}

	return polls, nil
}

func (r *PollRepository) DeletePoll(ctx context.Context, pollIDStr string, creatorID primitive.ObjectID) error {
	pollID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return errors.New("invalid poll ID format")
	}

	pollsColl := r.db.Collection("polls")
	res, err := pollsColl.DeleteOne(ctx, bson.M{"_id": pollID, "creator_id": creatorID})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("poll not found or unauthorized")
	}

	// Clean up Redis keys
	if r.redis != nil {
		_ = r.redis.Del(ctx, fmt.Sprintf("poll:counts:%s", pollIDStr)).Err()
		_ = r.redis.Del(ctx, fmt.Sprintf("poll:voters:%s", pollIDStr)).Err()
	}

	return nil
}
