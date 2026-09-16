package websocket

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"

	"backend/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow CORS for WebSockets
	},
}

type Client struct {
	PollID string
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	redis     *redis.Client
	clients   map[string]map[*Client]bool // map[pollID]map[*Client]bool
	subscribers map[string]*redis.PubSub   // map[pollID]*redis.PubSub
	register  chan *Client
	unregister chan *Client
	mu        sync.RWMutex
}

func NewHub(redisInst *database.RedisInstance) *Hub {
	var rClient *redis.Client
	if redisInst != nil {
		rClient = redisInst.Client
	}
	return &Hub{
		redis:       rClient,
		clients:     make(map[string]map[*Client]bool),
		subscribers: make(map[string]*redis.PubSub),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
	}
}

func (h *Hub) Run(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.clients[client.PollID]; !ok {
				h.clients[client.PollID] = make(map[*Client]bool)
				// Start Redis PubSub listener for this poll ID if not active
				h.startRedisListener(client.PollID)
			}
			h.clients[client.PollID][client] = true
			h.mu.Unlock()
			log.Printf("WebSocket client joined poll stream: %s (Total clients for poll: %d)", client.PollID, len(h.clients[client.PollID]))

		case client := <-h.unregister:
			h.mu.Lock()
			if pollClients, ok := h.clients[client.PollID]; ok {
				if _, exists := pollClients[client]; exists {
					delete(pollClients, client)
					close(client.Send)
					_ = client.Conn.Close()

					if len(pollClients) == 0 {
						delete(h.clients, client.PollID)
						h.stopRedisListener(client.PollID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("WebSocket client left poll stream: %s", client.PollID)
		}
	}
}

func (h *Hub) startRedisListener(pollID string) {
	if h.redis == nil {
		return
	}
	channel := "poll:channel:" + pollID
	pubsub := h.redis.Subscribe(context.Background(), channel)
	h.subscribers[pollID] = pubsub

	go func(pID string, ps *redis.PubSub) {
		ch := ps.Channel()
		for msg := range ch {
			h.mu.RLock()
			pollClients, exists := h.clients[pID]
			if exists {
				data := []byte(msg.Payload)
				for client := range pollClients {
					select {
					case client.Send <- data:
					default:
						close(client.Send)
						delete(pollClients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}(pollID, pubsub)
}

func (h *Hub) stopRedisListener(pollID string) {
	if ps, ok := h.subscribers[pollID]; ok {
		_ = ps.Close()
		delete(h.subscribers, pollID)
	}
}

func (h *Hub) ServeWS(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "poll ID is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade WebSocket: %v", err)
		return
	}

	client := &Client{
		PollID: pollID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	h.register <- client

	// Write pump
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer func() {
			ticker.Stop()
			_ = conn.Close()
		}()

		for {
			select {
			case message, ok := <-client.Send:
				_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if !ok {
					_ = conn.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					return
				}
			case <-ticker.C:
				_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
			}
		}
	}()

	// Read pump (keeps connection open & handles close)
	go func() {
		defer func() {
			h.unregister <- client
			_ = conn.Close()
		}()
		conn.SetReadLimit(512)
		_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		conn.SetPongHandler(func(string) error {
			_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
			return nil
		})
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}
