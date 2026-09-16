package config

import (
	"os"
	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	MongoURI    string
	DBName      string
	RedisURI    string
	RedisPass   string
	JWTSecret   string
	Environment string
}

func LoadConfig() *Config {
	// Load .env file if available
	_ = godotenv.Load()

	port := getEnv("PORT", "8080")
	mongoURI := getEnv("MONGO_URI", "mongodb://localhost:27017")
	dbName := getEnv("DB_NAME", "gazette_polletin")
	redisURI := getEnv("REDIS_URI", "localhost:6379")
	redisPass := getEnv("REDIS_PASSWORD", "")
	jwtSecret := getEnv("JWT_SECRET", "vintage_gazette_secret_key_1882_hcl_guvi")
	env := getEnv("ENV", "development")

	return &Config{
		Port:        port,
		MongoURI:    mongoURI,
		DBName:      dbName,
		RedisURI:    redisURI,
		RedisPass:   redisPass,
		JWTSecret:   jwtSecret,
		Environment: env,
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
