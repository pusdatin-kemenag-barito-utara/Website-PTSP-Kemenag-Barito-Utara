package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// SystemRepository menangani query DB khusus sistem (Cron cleanup, Ping).
type SystemRepository struct {
	db *pgxpool.Pool
}

func NewSystemRepository(db *pgxpool.Pool) *SystemRepository {
	return &SystemRepository{db: db}
}

func (r *SystemRepository) CleanupExpiredDocuments(ctx context.Context, olderThan time.Time) (int, int, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id FROM kemenag_ptsp.ptsp_service_requests
		WHERE status = 'completed' AND completed_at < $1
	`, olderThan)
	if err != nil {
		return 0, 0, err
	}
	defer rows.Close()

	var requestIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err == nil {
			requestIDs = append(requestIDs, id)
		}
	}

	if len(requestIDs) == 0 {
		return 0, 0, nil
	}

	deletedCount := 0
	for _, reqID := range requestIDs {
		res, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.ptsp_generated_documents SET file_path = 'EXPIRED'
			WHERE request_id = $1 AND file_path != 'EXPIRED'
		`, reqID)
		if err == nil {
			deletedCount += int(res.RowsAffected())
		}
		res2, err2 := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.ptsp_service_request_documents SET file_path = 'EXPIRED'
			WHERE request_id = $1 AND file_path != 'EXPIRED'
		`, reqID)
		if err2 == nil {
			deletedCount += int(res2.RowsAffected())
		}
	}

	return len(requestIDs), deletedCount, nil
}

func (r *SystemRepository) PingDB(ctx context.Context) error {
	var result int
	return r.db.QueryRow(ctx, "SELECT 1").Scan(&result)
}

func (r *SystemRepository) UpdateSystemSettings(ctx context.Context, settings map[string]interface{}) error {
	if allowManual, ok := settings["allowManual"]; ok {
		_, err := r.db.Exec(ctx, `UPDATE kemenag_ptsp.ptsp_system_status SET allow_manual_guest_book = $1 WHERE id = 'heartbeat'`, allowManual)
		if err != nil {
			return err
		}
	}
	if maintenanceMode, ok := settings["maintenanceMode"]; ok {
		message, _ := settings["maintenanceMessage"].(string)
		_, err := r.db.Exec(ctx, `UPDATE kemenag_ptsp.ptsp_system_status SET maintenance_mode = $1, maintenance_message = $2 WHERE id = 'heartbeat'`, maintenanceMode, message)
		if err != nil {
			return err
		}
	}
	if aiChat, ok := settings["aiChatEnabled"]; ok {
		_, err := r.db.Exec(ctx, `UPDATE kemenag_ptsp.ptsp_system_status SET ai_chat_enabled = $1 WHERE id = 'heartbeat'`, aiChat)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *SystemRepository) GetSystemStatus(ctx context.Context) (map[string]interface{}, error) {
	var allowManual bool
	var maintenanceMode bool
	var maintenanceMessage *string
	var aiChatEnabled bool

	err := r.db.QueryRow(ctx, `
		SELECT COALESCE(allow_manual_guest_book, false), COALESCE(maintenance_mode, false), maintenance_message, COALESCE(ai_chat_enabled, true)
		FROM kemenag_ptsp.ptsp_system_status
		WHERE id = 'heartbeat'
	`).Scan(&allowManual, &maintenanceMode, &maintenanceMessage, &aiChatEnabled)
	if err != nil {
		return map[string]interface{}{
			"allowManualGuestBook": false,
			"maintenanceMode":      false,
			"maintenanceMessage":   "Sistem sedang dalam pemeliharaan berkala.",
			"aiChatEnabled":        true,
		}, nil
	}

	msg := "Sistem sedang dalam pemeliharaan berkala."
	if maintenanceMessage != nil && *maintenanceMessage != "" {
		msg = *maintenanceMessage
	}

	return map[string]interface{}{
		"allowManualGuestBook": allowManual,
		"maintenanceMode":      maintenanceMode,
		"maintenanceMessage":   msg,
		"aiChatEnabled":        aiChatEnabled,
	}, nil
}

type YouTubeVideo struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	YouTubeID string    `json:"youtubeId"`
	CreatedAt time.Time `json:"createdAt"`
}

func (r *SystemRepository) GetYouTubeVideos(ctx context.Context) ([]YouTubeVideo, int, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, title, youtube_id, created_at
		FROM kemenag_website.youtube_videos
		WHERE is_published = true
		ORDER BY sort_order ASC
	`)
	if err == nil {
		defer rows.Close()
		var videos []YouTubeVideo
		for rows.Next() {
			var v YouTubeVideo
			if err := rows.Scan(&v.ID, &v.Title, &v.YouTubeID, &v.CreatedAt); err == nil {
				videos = append(videos, v)
			}
		}
		if len(videos) > 0 {
			var totalCount int
			_ = r.db.QueryRow(ctx, `
				SELECT COUNT(*) 
				FROM kemenag_website.youtube_videos 
				WHERE is_published = true
			`).Scan(&totalCount)

			if totalCount < len(videos) {
				totalCount = len(videos)
			}
			return videos, totalCount, nil
		}
	}

	// Fallback jika tabel belum ada atau tidak ada baris video
	fallbackVideos := []YouTubeVideo{
		{
			ID:        "1",
			Title:     "Profil Kantor Kementerian Agama Kabupaten Barito Utara",
			YouTubeID: "5N8O8jQ8b_0",
			CreatedAt: time.Now(),
		},
		{
			ID:        "2",
			Title:     "Pelayanan Terpadu Satu Pintu (Si ATAK) Kemenag Barito Utara",
			YouTubeID: "dQw4w9WgXcQ",
			CreatedAt: time.Now(),
		},
	}
	return fallbackVideos, len(fallbackVideos), nil
}

