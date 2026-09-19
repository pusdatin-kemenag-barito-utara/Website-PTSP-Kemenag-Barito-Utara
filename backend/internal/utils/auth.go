package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// JWTClaims mendefinisikan klaim payload di dalam token JWT mandiri PTSP Kemenag.
type JWTClaims struct {
	UserID      string   `json:"user_id"`
	Email       string   `json:"email"`
	Nama        string   `json:"nama"`
	Role        string   `json:"role"`
	UserType    string   `json:"user_type"` // "petugas" | "pegawai" | "pemohon"
	NIP         string   `json:"nip,omitempty"`
	Phone       string   `json:"phone,omitempty"`
	Permissions []string `json:"permissions,omitempty"`
	IsVerified  bool     `json:"is_verified"`
	Exp         int64    `json:"exp"`
	Iat         int64    `json:"iat"`
}

// HashPassword membuat hash bcrypt dari password teks biasa.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

// CheckPassword membandingkan password teks biasa dengan hash bcrypt.
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateJWT membuat token JWT standar HS256 dengan claims terformat.
func GenerateJWT(claims *JWTClaims, secret string) (string, error) {
	if secret == "" {
		return "", errors.New("jwt secret tidak boleh kosong")
	}

	header := map[string]string{
		"alg": "HS256",
		"typ": "JWT",
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", fmt.Errorf("gagal encode header: %w", err)
	}

	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", fmt.Errorf("gagal encode claims: %w", err)
	}

	headerB64 := base64.RawURLEncoding.EncodeToString(headerJSON)
	claimsB64 := base64.RawURLEncoding.EncodeToString(claimsJSON)

	unsignedToken := headerB64 + "." + claimsB64

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(unsignedToken))
	signature := mac.Sum(nil)
	sigB64 := base64.RawURLEncoding.EncodeToString(signature)

	return unsignedToken + "." + sigB64, nil
}

// VerifyJWT memvalidasi token JWT HS256 dan mengembalikan pointer ke JWTClaims.
func VerifyJWT(tokenStr, secret string) (*JWTClaims, error) {
	if tokenStr == "" {
		return nil, errors.New("token kosong")
	}

	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 {
		return nil, errors.New("struktur format token tidak valid")
	}

	headerB64, claimsB64, sigB64 := parts[0], parts[1], parts[2]
	unsignedToken := headerB64 + "." + claimsB64

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(unsignedToken))
	expectedSig := mac.Sum(nil)

	actualSig, err := base64.RawURLEncoding.DecodeString(sigB64)
	if err != nil {
		return nil, errors.New("gagal decode signature")
	}

	if subtle.ConstantTimeCompare(expectedSig, actualSig) != 1 {
		return nil, errors.New("tanda tangan (signature) token tidak valid")
	}

	claimsBytes, err := base64.RawURLEncoding.DecodeString(claimsB64)
	if err != nil {
		return nil, errors.New("gagal decode claims")
	}

	var claims JWTClaims
	if err := json.Unmarshal(claimsBytes, &claims); err != nil {
		return nil, errors.New("gagal parse json claims")
	}

	if claims.Exp > 0 && time.Now().Unix() > claims.Exp {
		return nil, errors.New("token sudah kedaluwarsa")
	}

	return &claims, nil
}
