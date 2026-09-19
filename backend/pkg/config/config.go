package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	MongoURI    string
	DBName      string
	RedisURI    string
	RedisPass   string
	JWTSecret   string
	FrontendURL string
	Environment string
}

func LoadConfig() *Config {
	// Search for .env in current CWD, backend/, parent dirs
	envFiles := []string{".env", "backend/.env", "../.env", "../../.env", "cmd/server/.env"}
	for _, file := range envFiles {
		if _, err := os.Stat(file); err == nil {
			_ = godotenv.Load(file)
			break
		}
	}

	return &Config{
		Port:        getEnv("PORT", "8080"),
		MongoURI:    getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		DBName:      getEnv("MONGODB_DATABASE", "pollnow"),
		RedisURI:    getEnv("REDIS_URL", "localhost:6379"),
		RedisPass:   getEnv("REDIS_PASSWORD", ""),
		JWTSecret:   getEnv("JWT_SECRET", "pollnow_jwt_super_secret_key_2026"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
		Environment: getEnv("ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		trimmed := strings.Trim(strings.TrimSpace(val), "\"'`")
		if trimmed != "" {
			return trimmed
		}
	}
	return fallback
}

// GetMaskedMongoURI masks sensitive passwords in database connection strings for logs
func (c *Config) GetMaskedMongoURI() string {
	uri := c.MongoURI
	if uri == "" {
		return "[NOT SET]"
	}

	// Handle mongodb+srv://user:pass@host/... or mongodb://user:pass@host/
	if idx := strings.Index(uri, "://"); idx != -1 {
		prefix := uri[:idx+3]
		rest := uri[idx+3:]
		if atIdx := strings.Index(rest, "@"); atIdx != -1 {
			userPass := rest[:atIdx]
			hostPart := rest[atIdx+1:]
			if colonIdx := strings.Index(userPass, ":"); colonIdx != -1 {
				user := userPass[:colonIdx]
				return prefix + user + ":****@" + hostPart
			}
			return prefix + "****@" + hostPart
		}
		return uri
	}
	return uri
}
