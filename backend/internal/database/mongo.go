package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"backend/internal/config"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoInstance struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func ConnectMongo(cfg *config.Config) (*MongoInstance, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to create Mongo client: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Printf("Warning: MongoDB ping failed (%v). Ensure MongoDB instance is accessible.", err)
	} else {
		log.Println("Successfully connected to MongoDB Atlas / Instance.")
	}

	db := client.Database(cfg.DBName)
	initIndexes(ctx, db)

	return &MongoInstance{
		Client: client,
		DB:     db,
	}, nil
}

func initIndexes(ctx context.Context, db *mongo.Database) {
	usersColl := db.Collection("users")
	_, _ = usersColl.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})

	pollsColl := db.Collection("polls")
	_, _ = pollsColl.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "owner_id", Value: 1}},
	})
	_, _ = pollsColl.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "created_at", Value: -1}},
	})

	votesColl := db.Collection("votes")
	_, _ = votesColl.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "poll_id", Value: 1},
			{Key: "voter_identifier", Value: 1},
		},
	})
}
