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
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/websocket"

	"github.com/gin-contrib/cors"
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
		log.Printf("Warning initializing Redis: %v", err)
	}

	// 3. Initialize WebSocket Hub
	wsHub := websocket.NewHub(redisInst)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go wsHub.Run(ctx)

	// 4. Repositories & Handlers
	authRepo := repository.NewAuthRepository(mongoInst)
	pollRepo := repository.NewPollRepository(mongoInst, redisInst)

	authHandler := handlers.NewAuthHandler(authRepo, cfg)
	pollHandler := handlers.NewPollHandler(pollRepo)

	// 5. Setup Gin Engine & CORS
	r := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowCredentials = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "online",
			"service": "The Gazette Polletin Go Backend",
			"time": time.Now().Format(time.RFC3339),
		})
	})

	// WebSocket Endpoint
	r.GET("/ws/polls/:id", wsHub.ServeWS)

	// API Routes
	api := r.Group("/api")
	{
		// Auth Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(cfg), authHandler.GetMe)
		}

		// Public Poll Routes
		polls := api.Group("/polls")
		{
			polls.GET("", pollHandler.GetPublicPolls)
			polls.GET("/:id", pollHandler.GetPollByID)
			polls.POST("/:id/vote", pollHandler.VotePoll)

			// Protected Poll Routes
			protected := polls.Group("")
			protected.Use(middleware.AuthMiddleware(cfg))
			{
				protected.POST("", pollHandler.CreatePoll)
				protected.GET("/my", pollHandler.GetMyPolls)
				protected.DELETE("/:id", pollHandler.DeletePoll)
			}
		}
	}

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("The Gazette Polletin Go Server running on port %s...", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced shutdown: %v", err)
	}

	log.Println("Server exited cleanly.")
}
