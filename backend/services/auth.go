package services

import (
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

type JwtWrapper struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

type JwtClaim struct {
	Username string `json:"username"`
	UserID   uint   `json:"user_id"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

func (j *JwtWrapper) GenerateToken(username string, userID uint, role string) (string, error) {
	claims := &JwtClaim{
		Username: username,
		UserID:   userID,
		Role:     role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * time.Duration(j.ExpirationHours)).Unix(),
			Issuer:    j.Issuer,
			IssuedAt:  time.Now().Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.SecretKey))
}

func (j *JwtWrapper) ValidateToken(signedToken string) (*JwtClaim, error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JwtClaim{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(j.SecretKey), nil
		},
	)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*JwtClaim)
	if !ok || !token.Valid {
		return nil, err
	}
	return claims, nil
}
