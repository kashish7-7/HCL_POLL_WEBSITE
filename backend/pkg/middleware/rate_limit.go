package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type clientLimiter struct {
	lastSeen time.Time
	count    int
}

type RateLimiter struct {
	mu       sync.Mutex
	clients  map[string]*clientLimiter
	limit    int
	window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*clientLimiter),
		limit:   limit,
		window:  window,
	}

	// Cleanup background routine
	go func() {
		for {
			time.Sleep(window)
			rl.mu.Lock()
			for ip, c := range rl.clients {
				if time.Since(c.lastSeen) > window {
					delete(rl.clients, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()

	return rl
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		rl.mu.Lock()

		cl, exists := rl.clients[ip]
		now := time.Now()

		if !exists || now.Sub(cl.lastSeen) > rl.window {
			rl.clients[ip] = &clientLimiter{
				lastSeen: now,
				count:    1,
			}
			rl.mu.Unlock()
			c.Next()
			return
		}

		if cl.count >= rl.limit {
			rl.mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please slow down and try again shortly.",
			})
			c.Abort()
			return
		}

		cl.count++
		cl.lastSeen = now
		rl.mu.Unlock()
		c.Next()
	}
}
