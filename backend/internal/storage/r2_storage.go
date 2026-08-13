package storage

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"net/url"

	"encoding/xml"

	"ptsp-kemenag-backend/internal/config"
)

// R2Storage mengelola upload, delete, dan URL file ke Cloudflare R2 Object Storage S3-Compatible API.
type R2Storage struct {
	cfg *config.Config
}

func NewR2Storage(cfg *config.Config) *R2Storage {
	return &R2Storage{cfg: cfg}
}

// GetURL mengembalikan URL publik R2 (atau URL lokal fallback jika R2 belum diisi)
func (s *R2Storage) GetURL(key string) string {
	if key == "" {
		return ""
	}
	if strings.HasPrefix(key, "http://") || strings.HasPrefix(key, "https://") {
		return key
	}
	domain := strings.TrimRight(s.cfg.R2PublicDomain, "/")
	if domain != "" {
		return fmt.Sprintf("%s/%s", domain, strings.TrimLeft(key, "/"))
	}
	// Fallback ke R2 default dev domain jika ada Account ID & Bucket Name
	if s.cfg.R2AccountId != "" && s.cfg.R2BucketName != "" {
		return fmt.Sprintf("https://pub-%s.r2.dev/%s", s.cfg.R2AccountId, strings.TrimLeft(key, "/"))
	}
	// Fallback ke server lokal
	return fmt.Sprintf("/uploads/%s", strings.TrimLeft(key, "/"))
}

// GetStats menghitung jumlah file dan total volume data di bucket.
// Jika R2 belum dikonfigurasi, menghitung dari folder uploads/ lokal.
func (s *R2Storage) GetStats(ctx context.Context) (fileCount int64, usage int64, err error) {
	if s.cfg.R2AccountId == "" || s.cfg.R2AccessKeyId == "" || s.cfg.R2SecretAccessKey == "" || s.cfg.R2BucketName == "" {
		return s.localStats()
	}

	host := fmt.Sprintf("%s.r2.cloudflarestorage.com", s.cfg.R2AccountId)
	client := &http.Client{Timeout: 30 * time.Second}

	continuation := ""
	for {
		query := "list-type=2&max-keys=1000"
		if continuation != "" {
			query += "&continuation-token=" + url.QueryEscape(continuation)
		}

		endpoint := fmt.Sprintf("https://%s/%s?%s", host, s.cfg.R2BucketName, query)
		req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
		if err != nil {
			return fileCount, usage, err
		}
		req.Header.Set("Host", host)

		now := time.Now().UTC()
		amzDate := now.Format("20060102T150405Z")
		dateStamp := now.Format("20060102")
		region := "auto"
		service := "s3"

		req.Header.Set("x-amz-date", amzDate)
		req.Header.Set("x-amz-content-sha256", "UNSIGNED-PAYLOAD")

		canonicalURI := fmt.Sprintf("/%s", s.cfg.R2BucketName)
		canonicalQuery := strings.ReplaceAll(query, "=", "%3D")
		canonicalQuery = strings.ReplaceAll(canonicalQuery, "&", "%26")
		canonicalHeaders := fmt.Sprintf("host:%s\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:%s\n", host, amzDate)
		signedHeaders := "host;x-amz-content-sha256;x-amz-date"
		canonicalRequest := fmt.Sprintf("GET\n%s\n%s\n%s\n%s\nUNSIGNED-PAYLOAD", canonicalURI, canonicalQuery, canonicalHeaders, signedHeaders)

		credentialScope := fmt.Sprintf("%s/%s/%s/aws4_request", dateStamp, region, service)
		stringToSign := fmt.Sprintf("AWS4-HMAC-SHA256\n%s\n%s\n%s", amzDate, credentialScope, sha256Hash([]byte(canonicalRequest)))

		signingKey := getSignatureKey(s.cfg.R2SecretAccessKey, dateStamp, region, service)
		signature := hex.EncodeToString(hmacSHA256(signingKey, []byte(stringToSign)))

		req.Header.Set("Authorization", fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
			s.cfg.R2AccessKeyId, credentialScope, signedHeaders, signature))

		resp, err := client.Do(req)
		if err != nil {
			return fileCount, usage, err
		}
		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			return fileCount, usage, fmt.Errorf("R2 list response %d: %s", resp.StatusCode, string(bodyBytes))
		}

		var parsed struct {
			Contents []struct {
				Size int64 `xml:"Size"`
			} `xml:"Contents"`
			IsTruncated       bool   `xml:"IsTruncated"`
			NextContinuation  string `xml:"NextContinuationToken"`
		}
		if err := xml.Unmarshal(bodyBytes, &parsed); err != nil {
			return fileCount, usage, fmt.Errorf("gagal parse respon R2 list: %w", err)
		}

		for _, obj := range parsed.Contents {
			fileCount++
			usage += obj.Size
		}

		if !parsed.IsTruncated {
			break
		}
		continuation = parsed.NextContinuation
	}

	return fileCount, usage, nil
}

func (s *R2Storage) localStats() (fileCount int64, usage int64, err error) {
	err = filepath.Walk("uploads", func(_ string, info os.FileInfo, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if info.IsDir() {
			return nil
		}
		fileCount++
		usage += info.Size()
		return nil
	})
	return fileCount, usage, err
}

// Upload mengunggah file ke Cloudflare R2 (atau ke folder lokal backend/uploads/ jika R2 belum dikonfigurasi).
func (s *R2Storage) Upload(ctx context.Context, key string, data []byte, contentType string) (string, error) {
	key = strings.TrimLeft(key, "/")

	// Jika R2 credentials diisi di env, upload langsung ke Cloudflare R2
	if s.cfg.R2AccountId != "" && s.cfg.R2AccessKeyId != "" && s.cfg.R2SecretAccessKey != "" && s.cfg.R2BucketName != "" {
		err := s.uploadToR2(ctx, key, data, contentType)
		if err == nil {
			return s.GetURL(key), nil
		}
		// Log warning jika R2 gagal dan fallback ke lokal
		fmt.Printf("⚠️ Warning R2 Upload (%s): %v. Fallback ke disk lokal.\n", key, err)
	}

	// Fallback: Simpan di disk lokal backend/uploads/
	localPath := filepath.Join("uploads", key)
	if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
		return "", fmt.Errorf("gagal membuat direktori lokal: %w", err)
	}
	if err := os.WriteFile(localPath, data, 0644); err != nil {
		return "", fmt.Errorf("gagal menulis file ke disk lokal: %w", err)
	}

	return s.GetURL(key), nil
}

// uploadToR2 melakukan S3 API PutObject ke Cloudflare R2 menggunakan Signature V4
func (s *R2Storage) uploadToR2(ctx context.Context, key string, data []byte, contentType string) error {
	host := fmt.Sprintf("%s.r2.cloudflarestorage.com", s.cfg.R2AccountId)
	endpoint := fmt.Sprintf("https://%s/%s/%s", host, s.cfg.R2BucketName, key)

	req, err := http.NewRequestWithContext(ctx, "PUT", endpoint, bytes.NewReader(data))
	if err != nil {
		return err
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Host", host)

	// AWS SigV4 Headers
	now := time.Now().UTC()
	amzDate := now.Format("20060102T150405Z")
	dateStamp := now.Format("20060102")
	region := "auto"
	service := "s3"

	req.Header.Set("x-amz-date", amzDate)
	payloadHash := sha256Hash(data)
	req.Header.Set("x-amz-content-sha256", payloadHash)

	// Canonical Request
	canonicalURI := fmt.Sprintf("/%s/%s", s.cfg.R2BucketName, key)
	canonicalHeaders := fmt.Sprintf("host:%s\nx-amz-content-sha256:%s\nx-amz-date:%s\n", host, payloadHash, amzDate)
	signedHeaders := "host;x-amz-content-sha256;x-amz-date"
	canonicalRequest := fmt.Sprintf("PUT\n%s\n\n%s\n%s\n%s", canonicalURI, canonicalHeaders, signedHeaders, payloadHash)

	// String to Sign
	credentialScope := fmt.Sprintf("%s/%s/%s/aws4_request", dateStamp, region, service)
	stringToSign := fmt.Sprintf("AWS4-HMAC-SHA256\n%s\n%s\n%s", amzDate, credentialScope, sha256Hash([]byte(canonicalRequest)))

	// Calculate Signature
	signingKey := getSignatureKey(s.cfg.R2SecretAccessKey, dateStamp, region, service)
	signature := hex.EncodeToString(hmacSHA256(signingKey, []byte(stringToSign)))

	authorizationHeader := fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		s.cfg.R2AccessKeyId, credentialScope, signedHeaders, signature)
	req.Header.Set("Authorization", authorizationHeader)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("R2 response %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

func sha256Hash(data []byte) string {
	h := sha256.New()
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}

func hmacSHA256(key []byte, data []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}

func getSignatureKey(key, dateStamp, regionName, serviceName string) []byte {
	kDate := hmacSHA256([]byte("AWS4"+key), []byte(dateStamp))
	kRegion := hmacSHA256(kDate, []byte(regionName))
	kService := hmacSHA256(kRegion, []byte(serviceName))
	kSigning := hmacSHA256(kService, []byte("aws4_request"))
	return kSigning
}
