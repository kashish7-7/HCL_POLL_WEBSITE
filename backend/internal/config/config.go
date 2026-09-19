package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	MongoURI           string
	DBName             string
	RedisURI           string
	RedisPass          string
	JWTSecret          string
	GoogleClientID     string
	GoogleClientSecret string
	FrontendURL        string
	Environment        string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	return &Config{
		Port:               getEnv("PORT", "8080"),
		MongoURI:           getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		DBName:             getEnv("MONGODB_DATABASE", "pulsevote"),
		RedisURI:           getEnv("REDIS_URL", "localhost:6379"),
		RedisPass:          getEnv("REDIS_PASSWORD", ""),
		JWTSecret:          getEnv("JWT_SECRET", "pulsevote_jwt_super_secret_key_2026"),
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		FrontendURL:        getEnv("FRONTEND_URL", "http://localhost:5173"),
		Environment:        getEnv("ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
