package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username     string             `bson:"username" json:"username"`
	Email        string             `bson:"email" json:"email"`
	PasswordHash string             `bson:"password_hash" json:"-"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
}

type Option struct {
	ID    string `bson:"id" json:"id"`
	Text  string `bson:"text" json:"text"`
	Votes int64  `bson:"votes" json:"votes"`
}

type Poll struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title         string             `bson:"title" json:"title"`
	Description   string             `bson:"description" json:"description"`
	Category      string             `bson:"category" json:"category"`
	CreatorID     primitive.ObjectID `bson:"creator_id" json:"creator_id"`
	CreatorName   string             `bson:"creator_name" json:"creator_name"`
	Options       []Option           `bson:"options" json:"options"`
	IsActive      bool               `bson:"is_active" json:"is_active"`
	AllowMultiple bool               `bson:"allow_multiple" json:"allow_multiple"`
	ExpiresAt     *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	TotalVotes    int64              `bson:"total_votes" json:"total_votes"`
}

type Vote struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID    primitive.ObjectID `bson:"poll_id" json:"poll_id"`
	OptionID  string             `bson:"option_id" json:"option_id"`
	VoterHash string             `bson:"voter_hash" json:"voter_hash"`
	IPAddress string             `bson:"ip_address" json:"ip_address"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

// DTOs
type RegisterInput struct {
	Username string `json:"username" binding:"required,min=3,max=30"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type CreatePollInput struct {
	Title             string   `json:"title" binding:"required,min=3,max=200"`
	Description       string   `json:"description" binding:"max=1000"`
	Category          string   `json:"category"`
	Options           []string `json:"options" binding:"required,min=2,max=10,dive,required,min=1,max=150"`
	AllowMultiple     bool     `json:"allow_multiple"`
	ExpirationMinutes *int     `json:"expiration_minutes"`
}

type VoteInput struct {
	OptionID string `json:"option_id" binding:"required"`
}

type VoteBroadcastPayload struct {
	PollID     string           `json:"poll_id"`
	OptionID   string           `json:"option_id"`
	Counts     map[string]int64 `json:"counts"`
	TotalVotes int64            `json:"total_votes"`
	Timestamp  int64            `json:"timestamp"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
