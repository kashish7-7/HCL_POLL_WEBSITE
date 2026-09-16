package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"backend/internal/database"
	"backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthRepository struct {
	db *mongo.Database
}

func NewAuthRepository(mongoInst *database.MongoInstance) *AuthRepository {
	return &AuthRepository{
		db: mongoInst.DB,
	}
}

func (r *AuthRepository) CreateUser(ctx context.Context, input models.RegisterInput) (*models.User, error) {
	usersColl := r.db.Collection("users")

	// Check if email exists
	var existing models.User
	err := usersColl.FindOne(ctx, bson.M{"email": input.Email}).Decode(&existing)
	if err == nil {
		return nil, errors.New("email address is already registered")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := models.User{
		ID:           primitive.NewObjectID(),
		Username:     input.Username,
		Email:        input.Email,
		PasswordHash: string(hash),
		CreatedAt:    time.Now(),
	}

	_, err = usersColl.InsertOne(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}

	return &user, nil
}

func (r *AuthRepository) AuthenticateUser(ctx context.Context, input models.LoginInput) (*models.User, error) {
	usersColl := r.db.Collection("users")

	var user models.User
	err := usersColl.FindOne(ctx, bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	return &user, nil
}

func (r *AuthRepository) GetUserByID(ctx context.Context, id primitive.ObjectID) (*models.User, error) {
	usersColl := r.db.Collection("users")

	var user models.User
	err := usersColl.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
