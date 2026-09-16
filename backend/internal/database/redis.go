package database

import (
	"context"
	"log"
	"time"

	"backend/internal/config"

	"github.com/redis/go-redis/v9"
)

type RedisInstance struct {
	Client *redis.Client
}

func ConnectRedis(cfg *config.Config) (*RedisInstance, error) {
	opts, err := redis.ParseURL(cfg.RedisURI)
	if err != nil {
		// Fallback to plain address if not a full URL
		opts = &redis.Options{
			Addr:     cfg.RedisURI,
			Password: cfg.RedisPass,
			DB:       0,
		}
	}

	client := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("Warning: Redis ping failed (%v). Ensure Redis server is active.", err)
	} else {
		log.Println("Successfully connected to Redis.")
	}

	return &RedisInstance{
		Client: client,
	}, nil
}
