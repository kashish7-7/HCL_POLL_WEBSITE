package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/realtime"
	"backend/internal/repository"
	"backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 1. Initialize MongoDB
	mongoInst, err := database.ConnectMongo(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize MongoDB: %v", err)
	}

	// 2. Initialize Redis
	redisInst, err := database.ConnectRedis(cfg)
	if err != nil {
		log.Printf("Warning: Redis initialization issue: %v", err)
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
	pollHandler := handlers.NewPollHandler(pollRepo)

	// 5. Setup Router
	router := routes.SetupRouter(cfg, authHandler, pollHandler, wsHub)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("PulseVote Go Backend listening on port %s...", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown handler
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down PulseVote backend gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Forced server shutdown: %v", err)
	}

	log.Println("Server stopped cleanly.")
}
