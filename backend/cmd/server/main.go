package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/pkg/config"
	"backend/pkg/database"
	"backend/pkg/handlers"
	"backend/pkg/realtime"
	"backend/pkg/repository"
	"backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("PollNow backend starting...")
	log.Println("Loading configuration...")

	cfg := config.LoadConfig()

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 1. Initialize MongoDB
	log.Printf("Connecting to MongoDB... (Target: %s)", cfg.GetMaskedMongoURI())
	mongoInst, err := database.ConnectMongo(cfg)
	if err != nil {
		log.Printf("\n=======================================================\nMongoDB Connection FAILED:\n%v\nCheck MONGODB_URI in backend/.env\n=======================================================\n", err)
		log.Fatalf("PollNow backend failed to start because MongoDB is unavailable.")
	}
	log.Println("MongoDB connected successfully.")

	// 2. Initialize Redis
	log.Printf("Connecting to Redis... (Target: %s)", cfg.RedisURI)
	redisInst, err := database.ConnectRedis(cfg)
	if err != nil {
		log.Printf("Warning: Redis connection FAILED (%v). Check REDIS_URL in backend/.env", err)
	} else {
		log.Println("Redis connected successfully.")
	}

	// 3. Initialize Realtime WebSocket Hub
	wsHub := realtime.NewHub(redisInst)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go wsHub.Run(ctx)

	// 4. Initialize Repositories & Handlers
	authRepo := repository.NewAuthRepository(mongoInst)
	pollRepo := repository.NewPollRepository(mongoInst, redisInst)

	authHandler := handlers.NewAuthHandler(authRepo, cfg)
	pollHandler := handlers.NewPollHandler(pollRepo, wsHub)

	// 5. Setup Router
	router := routes.SetupRouter(cfg, authHandler, pollHandler, wsHub)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("Starting Gin server on :%s...", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown handler
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down PollNow backend gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Forced server shutdown: %v", err)
	}

	log.Println("Server stopped cleanly.")
}
