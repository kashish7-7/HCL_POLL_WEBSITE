package handlers

import (
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
	return &PollHandler{repo: repo}
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

	ownerID := userIDVal.(primitive.ObjectID)
	ownerName := c.GetString("username")
	if ownerName == "" {
		ownerName = c.GetString("userEmail")
	}

	poll, err := h.repo.CreatePoll(c.Request.Context(), input, ownerID, ownerName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully!",
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

func (h *PollHandler) GetPollResults(c *gin.Context) {
	pollID := c.Param("id")
	results, err := h.repo.GetPollResults(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}

func (h *PollHandler) VotePoll(c *gin.Context) {
	pollID := c.Param("id")

	var input models.VoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	clientIP := c.ClientIP()

	broadcast, err := h.repo.CastVote(c.Request.Context(), pollID, input.OptionID, input.VoterID, clientIP)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vote submitted successfully",
		"payload": broadcast,
	})
}

func (h *PollHandler) ClosePoll(c *gin.Context) {
	pollID := c.Param("id")
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ownerID := userIDVal.(primitive.ObjectID)
	err := h.repo.ClosePoll(c.Request.Context(), pollID, ownerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Poll closed successfully"})
}

func (h *PollHandler) GetMyPolls(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ownerID := userIDVal.(primitive.ObjectID)
	polls, err := h.repo.GetUserPolls(c.Request.Context(), ownerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"polls": polls})
}

func (h *PollHandler) DeletePoll(c *gin.Context) {
	pollID := c.Param("id")
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ownerID := userIDVal.(primitive.ObjectID)
	err := h.repo.DeletePoll(c.Request.Context(), pollID, ownerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Poll deleted successfully"})
}
