package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"backend/internal/models"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PollHandler struct {
	repo *repository.PollRepository
}

func NewPollHandler(repo *repository.PollRepository) *PollHandler {
	return &PollHandler{
		repo: repo,
	}
}

func (h *PollHandler) CreatePoll(c *gin.Context) {
	var input models.CreatePollInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required to create a poll"})
		return
	}

	creatorID := userIDVal.(primitive.ObjectID)
	creatorName := c.GetString("username")
	if creatorName == "" {
		creatorName = "Anonymous Editor"
	}

	poll, err := h.repo.CreatePoll(c.Request.Context(), input, creatorID, creatorName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll published successfully to the Gazette!",
		"poll":    poll,
	})
}

func (h *PollHandler) GetPollByID(c *gin.Context) {
	pollID := c.Param("id")
	poll, err := h.repo.GetPollByID(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"poll": poll})
}

func (h *PollHandler) GetPublicPolls(c *gin.Context) {
	polls, err := h.repo.GetPublicPolls(c.Request.Context(), 50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"polls": polls})
}

func (h *PollHandler) GetMyPolls(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	creatorID := userIDVal.(primitive.ObjectID)
	polls, err := h.repo.GetUserPolls(c.Request.Context(), creatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"polls": polls})
}

func (h *PollHandler) VotePoll(c *gin.Context) {
	pollID := c.Param("id")

	var input models.VoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	voterIP := c.ClientIP()
	
	// Check for voter cookie or generate temporary browser session identifier
	voterIdentifier, err := c.Cookie("gazette_voter_id")
	if err != nil || voterIdentifier == "" {
		bytes := make([]byte, 16)
		_, _ = rand.Read(bytes)
		voterIdentifier = hex.EncodeToString(bytes)
		c.SetCookie("gazette_voter_id", voterIdentifier, 3600*24*365, "/", "", false, false)
	}

	broadcastPayload, err := h.repo.CastVote(c.Request.Context(), pollID, input.OptionID, voterIP, voterIdentifier)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Your vote has been recorded by the Gazette!",
		"payload": broadcastPayload,
	})
}

func (h *PollHandler) DeletePoll(c *gin.Context) {
	pollID := c.Param("id")
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	creatorID := userIDVal.(primitive.ObjectID)
	err := h.repo.DeletePoll(c.Request.Context(), pollID, creatorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Poll deleted successfully"})
}
