package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email        string             `bson:"email" json:"email"`
	PasswordHash string             `bson:"password_hash,omitempty" json:"-"`
	GoogleID     string             `bson:"google_id,omitempty" json:"google_id,omitempty"`
	Username     string             `bson:"username" json:"username"`
	AuthProvider string             `bson:"auth_provider" json:"auth_provider"` // "email" or "google"
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
}

type Option struct {
	ID   string `bson:"id" json:"id"`
	Text string `bson:"text" json:"text"`
}

type Poll struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OwnerID   primitive.ObjectID `bson:"owner_id" json:"owner_id"`
	OwnerName string             `bson:"owner_name" json:"owner_name"`
	Question  string             `bson:"question" json:"question"`
	Options   []Option           `bson:"options" json:"options"`
	IsActive  bool               `bson:"is_active" json:"is_active"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

type Vote struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID          primitive.ObjectID `bson:"poll_id" json:"poll_id"`
	OptionID        string             `bson:"option_id" json:"option_id"`
	VoterIdentifier string             `bson:"voter_identifier" json:"voter_identifier"`
	IPAddress       string             `bson:"ip_address" json:"ip_address"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
}

// DTOs
type RegisterInput struct {
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type GoogleAuthInput struct {
	Credential string `json:"credential" binding:"required"`
}

type CreatePollInput struct {
	Question string   `json:"question" binding:"required,min=5,max=300"`
	Options  []string `json:"options" binding:"required,min=2,max=10,dive,required,min=1,max=150"`
}

type VoteInput struct {
	OptionID string `json:"option_id" binding:"required"`
	VoterID  string `json:"voter_id" binding:"required"`
}

type OptionResult struct {
	ID         string  `json:"id"`
	Text       string  `json:"text"`
	Votes      int64   `json:"votes"`
	Percentage float64 `json:"percentage"`
}

type PollResultPayload struct {
	PollID     string         `json:"poll_id"`
	Question   string         `json:"question"`
	IsActive   bool           `json:"is_active"`
	TotalVotes int64          `json:"total_votes"`
	Counts     map[string]int64 `json:"counts"`
	Options    []OptionResult `json:"options"`
}

type RealtimeBroadcastEvent struct {
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
