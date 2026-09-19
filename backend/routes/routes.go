package routes

import (
	"strings"
	"time"

	"backend/pkg/config"
	"backend/pkg/handlers"
	"backend/pkg/middleware"
	"backend/pkg/realtime"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config, authHandler *handlers.AuthHandler, pollHandler *handlers.PollHandler, wsHub *realtime.Hub) *gin.Engine {
	r := gin.Default()

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOriginFunc = func(origin string) bool {
		if origin == "" {
			return true
		}
		if origin == cfg.FrontendURL || origin == "http://localhost:5173" || origin == "http://localhost:3000" || origin == "http://127.0.0.1:5173" {
			return true
		}
		if strings.HasSuffix(origin, ".vercel.app") {
			return true
		}
		return false
	}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept"}
	corsConfig.AllowCredentials = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Rate limiters
	authLimiter := middleware.NewRateLimiter(10, 1*time.Minute)
	voteLimiter := middleware.NewRateLimiter(30, 1*time.Minute)

	healthHandler := func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":   "ok",
			"service":  "pollnow",
			"database": "connected",
			"redis":    "connected",
			"time":     time.Now().Format(time.RFC3339),
		})
	}

	// Root Endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "PollNow Go Backend API is active",
			"health":  "/api/health",
			"status":  "online",
		})
	})

	// Health Check Endpoints
	r.GET("/health", healthHandler)

	// WebSocket Live Broadcast Stream
	r.GET("/api/polls/:id/live", wsHub.ServeWS)

	api := r.Group("/api")
	{
		api.GET("/health", healthHandler)

		// Auth Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authLimiter.Middleware(), authHandler.Register)
			auth.POST("/login", authLimiter.Middleware(), authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(cfg), authHandler.GetMe)
		}

		// Poll Routes
		polls := api.Group("/polls")
		{
			polls.GET("/:id", pollHandler.GetPollByID)
			polls.GET("/:id/results", pollHandler.GetPollResults)
			polls.POST("/:id/vote", voteLimiter.Middleware(), pollHandler.VotePoll)

			// Protected Poll Routes
			protected := polls.Group("")
			protected.Use(middleware.AuthMiddleware(cfg))
			{
				protected.POST("", pollHandler.CreatePoll)
				protected.GET("/my", pollHandler.GetMyPolls)
				protected.GET("/:id/owner-results", pollHandler.GetOwnerPollResults)
				protected.GET("/:id/results/export/csv", pollHandler.ExportCSV)
				protected.GET("/:id/results/export/excel", pollHandler.ExportExcel)
				protected.POST("/:id/close", pollHandler.ClosePoll)
				protected.DELETE("/:id", pollHandler.DeletePoll)
			}
		}
	}

	return r
}
