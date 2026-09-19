package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type GoogleTokenInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Aud           string `json:"aud"`
	Error         string `json:"error_description"`
}

type GoogleAuthService struct {
	httpClient *http.Client
}

func NewGoogleAuthService() *GoogleAuthService {
	return &GoogleAuthService{
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *GoogleAuthService) VerifyIDToken(idToken string) (*GoogleTokenInfo, error) {
	if idToken == "" {
		return nil, errors.New("google credential token cannot be empty")
	}

	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to contact Google token verification service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("invalid or expired Google ID token")
	}

	var info GoogleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("failed to parse Google token response: %w", err)
	}

	if info.Error != "" {
		return nil, errors.New(info.Error)
	}

	if info.Email == "" {
		return nil, errors.New("no email associated with this Google token")
	}

	return &info, nil
}
