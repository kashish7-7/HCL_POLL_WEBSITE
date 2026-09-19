package handlers

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"backend/pkg/export"
	"backend/pkg/models"
	"backend/pkg/realtime"
	"backend/pkg/repository"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PollHandler struct {
	repo  *repository.PollRepository
	wsHub *realtime.Hub
}

func NewPollHandler(repo *repository.PollRepository, wsHub *realtime.Hub) *PollHandler {
	return &PollHandler{
		repo:  repo,
		wsHub: wsHub,
	}
}

func (h *PollHandler) CreatePoll(c *gin.Context) {
	var input models.CreatePollInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate schedule bounds if provided
	if input.StartAt != nil && input.EndAt != nil {
		if !input.EndAt.After(*input.StartAt) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
			return
		}
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

func (h *PollHandler) GetOwnerPollResults(c *gin.Context) {
	pollID := c.Param("id")
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ownerID := userIDVal.(primitive.ObjectID)

	// Fetch poll metadata to check ownership
	poll, err := h.repo.GetPollByID(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	if poll.OwnerID != ownerID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You are not the owner of this poll"})
		return
	}

	results, err := h.repo.GetPollResults(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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

	log.Printf("[REALTIME] Vote registered for poll %s, option %s", pollID, input.OptionID)
	if h.wsHub != nil && broadcast != nil {
		if payloadBytes, err := json.Marshal(broadcast); err == nil {
			h.wsHub.Broadcast(pollID, payloadBytes)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vote submitted successfully",
		"payload": broadcast,
	})
}

func (h *PollHandler) ExportCSV(c *gin.Context) {
	pollID := c.Param("id")
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ownerID := userIDVal.(primitive.ObjectID)

	poll, err := h.repo.GetPollByID(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	if poll.OwnerID != ownerID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You are not the owner of this poll"})
		return
	}

	results, err := h.repo.GetPollResults(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=pollnow-results-%s.csv", pollID))

	buf := new(bytes.Buffer)
	writer := csv.NewWriter(buf)

	_ = writer.Write([]string{"Poll Question", "Option ID", "Option Text", "Votes", "Percentage (%)"})
	for _, opt := range results.Options {
		_ = writer.Write([]string{
			results.Question,
			opt.ID,
			opt.Text,
			strconv.FormatInt(opt.Votes, 10),
			fmt.Sprintf("%.2f", opt.Percentage),
		})
	}
	_ = writer.Write([]string{results.Question, "SUMMARY", "Total Votes Recorded", strconv.FormatInt(results.TotalVotes, 10), "100.00"})
	writer.Flush()

	c.String(http.StatusOK, buf.String())
}

func (h *PollHandler) ExportExcel(c *gin.Context) {
	pollID := c.Param("id")
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ownerID := userIDVal.(primitive.ObjectID)

	poll, err := h.repo.GetPollByID(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	if poll.OwnerID != ownerID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You are not the owner of this poll"})
		return
	}

	results, err := h.repo.GetPollResults(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	xlsxData, err := export.GenerateExcel(results.Question, results.Options, results.TotalVotes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Excel file: " + err.Error()})
		return
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=pollnow-results-%s.xlsx", pollID))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsxData)
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
