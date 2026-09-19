package realtime

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
		return true // Allow cross-origin WebSocket connections
	},
}

type Client struct {
	PollID string
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	redis       *redis.Client
	clients     map[string]map[*Client]bool // map[pollID]map[*Client]bool
	subscribers map[string]*redis.PubSub   // map[pollID]*redis.PubSub
	register    chan *Client
	unregister  chan *Client
	mu          sync.RWMutex
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
	log.Println("[REALTIME] WebSocket Hub active and running.")
	for {
		select {
		case <-ctx.Done():
			log.Println("[REALTIME] Stopping WebSocket Hub.")
			return
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.clients[client.PollID]; !ok {
				h.clients[client.PollID] = make(map[*Client]bool)
				h.startRedisListener(client.PollID)
			}
			h.clients[client.PollID][client] = true
			activeCount := len(h.clients[client.PollID])
			h.mu.Unlock()
			log.Printf("[REALTIME] WebSocket client registered for poll: %s (Active listeners: %d)", client.PollID, activeCount)

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
			log.Printf("[REALTIME] WebSocket client disconnected from poll: %s", client.PollID)
		}
	}
}

func (h *Hub) Broadcast(pollID string, data []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

	pollClients, exists := h.clients[pollID]
	if !exists || len(pollClients) == 0 {
		log.Printf("[REALTIME][WS] Broadcast requested for poll %s, but 0 WebSocket clients currently connected.", pollID)
		return
	}

	log.Printf("[REALTIME][WS] broadcasting poll=%s clients=%d", pollID, len(pollClients))
	for client := range pollClients {
		select {
		case client.Send <- data:
		default:
			close(client.Send)
			delete(pollClients, client)
		}
	}
}

func (h *Hub) startRedisListener(pollID string) {
	if h.redis == nil {
		log.Printf("[REALTIME][SUBSCRIBER] Redis instance unavailable. Poll %s using local in-memory broadcasting.", pollID)
		return
	}
	channel := "poll:" + pollID + ":updates"
	pubsub := h.redis.Subscribe(context.Background(), channel)
	h.subscribers[pollID] = pubsub
	log.Printf("[REALTIME][SUBSCRIBER] subscribed channel=%s", channel)

	go func(pID string, ps *redis.PubSub) {
		ch := ps.Channel()
		for msg := range ch {
			log.Printf("[REALTIME][SUBSCRIBER] message received channel=%s payload=%s", msg.Channel, msg.Payload)
			h.Broadcast(pID, []byte(msg.Payload))
		}
	}(pollID, pubsub)
}

func (h *Hub) stopRedisListener(pollID string) {
	if ps, ok := h.subscribers[pollID]; ok {
		_ = ps.Close()
		delete(h.subscribers, pollID)
		log.Printf("[REALTIME] Unsubscribed from Redis Pub/Sub channel for poll: %s", pollID)
	}
}

func (h *Hub) ServeWS(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "poll ID parameter is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[REALTIME] Failed to upgrade WebSocket connection: %v", err)
		return
	}

	client := &Client{
		PollID: pollID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	h.register <- client

	// Write pump: sends ping/pong and pushes messages to client
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

	// Read pump: reads control messages & maintains connection deadline
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
