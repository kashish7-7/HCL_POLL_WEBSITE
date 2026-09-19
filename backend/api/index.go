package handler

import (
	"context"
	"log"
	"net/http"
	"sync"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/realtime"
	"backend/internal/repository"
	"backend/routes"
)

var (
	app     http.Handler
	once    sync.Once
	initErr error
)

func initialize() {
	log.Println("[VERCEL] Initializing PollNow Backend Serverless Function...")

	cfg := config.LoadConfig()

	// 1. Connect MongoDB
	log.Printf("[VERCEL] Connecting to MongoDB... (Target: %s)", cfg.GetMaskedMongoURI())
	mongoInst, err := database.ConnectMongo(cfg)
	if err != nil {
		log.Printf("[VERCEL][ERROR] MongoDB Connection Failed: %v", err)
		initErr = err
		return
	}
	log.Println("[VERCEL] MongoDB connected successfully.")

	// 2. Connect Redis
	log.Printf("[VERCEL] Connecting to Redis... (Target: %s)", cfg.RedisURI)
	redisInst, err := database.ConnectRedis(cfg)
	if err != nil {
		log.Printf("[VERCEL][WARN] Redis Connection Failed: %v", err)
	} else {
		log.Println("[VERCEL] Redis connected successfully.")
	}

	// 3. Initialize Realtime WebSocket Hub
	wsHub := realtime.NewHub(redisInst)
	ctx := context.Background()
	go wsHub.Run(ctx)

	// 4. Repositories & Handlers
	authRepo := repository.NewAuthRepository(mongoInst)
	pollRepo := repository.NewPollRepository(mongoInst, redisInst)

	authHandler := handlers.NewAuthHandler(authRepo, cfg)
	pollHandler := handlers.NewPollHandler(pollRepo, wsHub)

	// 5. Router
	app = routes.SetupRouter(cfg, authHandler, pollHandler, wsHub)
	log.Println("[VERCEL] PollNow Backend Serverless Function Initialized successfully.")
}

func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(initialize)

	if initErr != nil {
		http.Error(w, "Database Connection Error: "+initErr.Error(), http.StatusInternalServerError)
		return
	}

	app.ServeHTTP(w, r)
}
