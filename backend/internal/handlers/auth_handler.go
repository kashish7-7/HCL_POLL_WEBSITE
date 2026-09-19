package handlers

import (
	"net/http"

	"backend/internal/config"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthHandler struct {
	repo *repository.AuthRepository
	cfg  *config.Config
}

func NewAuthHandler(repo *repository.AuthRepository, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		repo: repo,
		cfg:  cfg,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.repo.CreateUser(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := middleware.GenerateToken(user.ID.Hex(), user.Email, user.Username, h.cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to issue token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.repo.AuthenticateEmail(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	token, err := middleware.GenerateToken(user.ID.Hex(), user.Email, user.Username, h.cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to issue token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objID := userIDVal.(primitive.ObjectID)
	user, err := h.repo.GetUserByID(c.Request.Context(), objID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}
