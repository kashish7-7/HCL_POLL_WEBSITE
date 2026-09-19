package database

import (
	"context"
	"fmt"
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
		return nil, fmt.Errorf("Redis connection failed: %v", err)
	}

	log.Println("Redis connection successful.")

	return &RedisInstance{
		Client: client,
	}, nil
}
