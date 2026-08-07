package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"ptsp-kemenag-backend/internal/models"
)

// RequestRepository menangani operasi DB permohonan layanan (ptsp_service_requests) dan dashboard statistics.
type RequestRepository struct {
	db *pgxpool.Pool
}

func NewRequestRepository(db *pgxpool.Pool) *RequestRepository {
	return &RequestRepository{db: db}
}

func (r *RequestRepository) FindAll(ctx context.Context, userID, status string, limit int) ([]models.ServiceRequest, error) {
	query := `
		SELECT r.id, r.user_id, r.service_id, r.service_item_id, r.request_number, r.status,
		       r.submitted_at, r.approved_at, r.rejected_at, r.completed_at, r.created_at,
		       s.name AS service_name, si.name AS item_name
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.ptsp_service_items si ON si.id = r.service_item_id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if userID != "" {
		query += fmt.Sprintf(" AND r.user_id = $%d", argIdx)
		args = append(args, userID)
		argIdx++
	}
	if status != "" {
		query += fmt.Sprintf(" AND r.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}
	query += fmt.Sprintf(" ORDER BY r.created_at DESC LIMIT $%d", argIdx)
	args = append(args, limit)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.ServiceRequest
	for rows.Next() {
		var req models.ServiceRequest
		if err := rows.Scan(&req.ID, &req.UserID, &req.ServiceID, &req.ServiceItemID, &req.RequestNumber, &req.Status,
			&req.SubmittedAt, &req.ApprovedAt, &req.RejectedAt, &req.CompletedAt, &req.CreatedAt, &req.ServiceName, &req.ItemName); err == nil {
			result = append(result, req)
		}
	}
	return result, nil
}

func (r *RequestRepository) FindByNumber(ctx context.Context, requestNumber string) (*models.ServiceRequest, error) {
	var req models.ServiceRequest
	err := r.db.QueryRow(ctx, `
		SELECT r.id, r.user_id, r.service_id, r.service_item_id, r.request_number, r.status,
		       r.submitted_at, r.completed_at, r.rejected_at, r.created_at,
		       r.revision_note, r.rejection_reason, s.name, si.name
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.ptsp_service_items si ON si.id = r.service_item_id
		WHERE r.request_number = $1
	`, requestNumber).Scan(&req.ID, &req.UserID, &req.ServiceID, &req.ServiceItemID, &req.RequestNumber, &req.Status,
		&req.SubmittedAt, &req.CompletedAt, &req.RejectedAt, &req.CreatedAt, &req.RevisionNote, &req.RejectionReason, &req.ServiceName, &req.ItemName)

	if err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *RequestRepository) FindByID(ctx context.Context, id string) (*models.ServiceRequestDetail, error) {
	var detail models.ServiceRequestDetail
	err := r.db.QueryRow(ctx, `
		SELECT r.id, r.user_id, r.service_id, r.service_item_id, r.request_number, r.status,
		       r.submitted_at, r.approved_at, r.rejected_at, r.completed_at, r.created_at,
		       r.revision_note, r.rejection_reason,
		       s.name, COALESCE(s.role_owner, ''), COALESCE(s.category, 'public'),
		       si.name,
		       COALESCE(p.full_name, ''), COALESCE(p.email, '')
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.ptsp_service_items si ON si.id = r.service_item_id
		LEFT JOIN kemenag_ptsp.profiles p ON p.id = r.user_id
		WHERE r.id = $1
	`, id).Scan(&detail.ID, &detail.UserID, &detail.ServiceID, &detail.ServiceItemID, &detail.RequestNumber, &detail.Status,
		&detail.SubmittedAt, &detail.ApprovedAt, &detail.RejectedAt, &detail.CompletedAt, &detail.CreatedAt,
		&detail.RevisionNote, &detail.RejectionReason,
		&detail.ServiceName, &detail.RoleOwner, &detail.Category,
		&detail.ItemName,
		&detail.ApplicantName, &detail.ApplicantEmail)

	if err != nil {
		return nil, err
	}

	// Fetch answers
	answerRows, _ := r.db.Query(ctx, `SELECT field_name, COALESCE(field_value, '') FROM kemenag_ptsp.ptsp_service_request_answers WHERE request_id = $1 ORDER BY created_at ASC`, id)
	if answerRows != nil {
		defer answerRows.Close()
		for answerRows.Next() {
			var ans models.RequestAnswer
			if err := answerRows.Scan(&ans.FieldName, &ans.FieldValue); err == nil {
				detail.Answers = append(detail.Answers, ans)
			}
		}
	}

	// Fetch documents
	docRows, _ := r.db.Query(ctx, `SELECT id::text, COALESCE(file_name, ''), COALESCE(file_path, ''), COALESCE(file_type, ''), COALESCE(file_size, 0) FROM kemenag_ptsp.ptsp_service_request_documents WHERE request_id = $1`, id)
	if docRows != nil {
		defer docRows.Close()
		for docRows.Next() {
			var doc models.RequestDocument
			if err := docRows.Scan(&doc.ID, &doc.FileName, &doc.FilePath, &doc.FileType, &doc.FileSize); err == nil {
				detail.Documents = append(detail.Documents, doc)
			}
		}
	}

	// Fetch reviews
	reviewRows, _ := r.db.Query(ctx, `
		SELECT rr.id::text, rr.action, COALESCE(rr.note, ''), rr.created_at, COALESCE(p.full_name, '')
		FROM kemenag_ptsp.ptsp_service_request_reviews rr
		LEFT JOIN kemenag_ptsp.profiles p ON p.id = rr.reviewer_id
		WHERE rr.request_id = $1 ORDER BY rr.created_at DESC
	`, id)
	if reviewRows != nil {
		defer reviewRows.Close()
		for reviewRows.Next() {
			var rev models.RequestReview
			if err := reviewRows.Scan(&rev.ID, &rev.Action, &rev.Note, &rev.CreatedAt, &rev.ReviewerName); err == nil {
				detail.Reviews = append(detail.Reviews, rev)
			}
		}
	}

	// Fetch activity logs
	logRows, _ := r.db.Query(ctx, `
		SELECT id::text, COALESCE(action, ''), COALESCE(actor_name, ''), created_at
		FROM kemenag_ptsp.ptsp_service_request_activity_logs
		WHERE request_id = $1 ORDER BY created_at DESC LIMIT 50
	`, id)
	if logRows != nil {
		defer logRows.Close()
		for logRows.Next() {
			var log models.ActivityLog
			if err := logRows.Scan(&log.ID, &log.Action, &log.ActorName, &log.CreatedAt); err == nil {
				detail.ActivityLogs = append(detail.ActivityLogs, log)
			}
		}
	}

	return &detail, nil
}

func (r *RequestRepository) UpdateStatus(ctx context.Context, id string, req models.UpdateRequestStatusRequest) error {
	now := time.Now()
	var query string
	var args []interface{}

	switch req.Status {
	case "approved":
		query = `UPDATE kemenag_ptsp.ptsp_service_requests SET status = 'approved', approved_at = $1, updated_at = $2 WHERE id = $3`
		args = []interface{}{now, now, id}
	case "rejected":
		query = `UPDATE kemenag_ptsp.ptsp_service_requests SET status = 'rejected', rejected_at = $1, rejection_reason = $2, updated_at = $3 WHERE id = $4`
		args = []interface{}{now, req.RejectionReason, now, id}
	case "completed":
		query = `UPDATE kemenag_ptsp.ptsp_service_requests SET status = 'completed', completed_at = $1, updated_at = $2 WHERE id = $3`
		args = []interface{}{now, now, id}
	case "revision":
		query = `UPDATE kemenag_ptsp.ptsp_service_requests SET status = 'revision', revision_note = $1, updated_at = $2 WHERE id = $3`
		args = []interface{}{req.RevisionNote, now, id}
	default:
		return fmt.Errorf("invalid status")
	}

	_, err := r.db.Exec(ctx, query, args...)
	return err
}

func (r *RequestRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_requests WHERE id = $1`, id)
	return err
}

func (r *RequestRepository) GetDashboardStats(ctx context.Context) (*models.DashboardStats, error) {
	var stats models.DashboardStats

	// 1. Total Layanan Aktif per Kategori (public vs asn)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_services WHERE is_active = true AND COALESCE(category, 'public') = 'public'`).Scan(&stats.Masyarakat.ServiceCount)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_services WHERE is_active = true AND COALESCE(category, 'public') = 'asn'`).Scan(&stats.Pegawai.ServiceCount)

	// 2. Total Akun Pengguna (Masyarakat vs Pegawai Internal)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_pusdatin.profiles WHERE COALESCE(user_type, 'eksternal_masyarakat') = 'eksternal_masyarakat'`).Scan(&stats.Masyarakat.UserCount)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_pusdatin.profiles WHERE COALESCE(user_type, 'eksternal_masyarakat') IN ('internal_pegawai', 'internal_admin')`).Scan(&stats.Pegawai.UserCount)

	// 3. Stat Pengajuan Masyarakat (category = 'public')
	r.db.QueryRow(ctx, `
		SELECT COUNT(*),
		       COUNT(CASE WHEN r.status IN ('submitted', 'under_review') THEN 1 END),
		       COUNT(CASE WHEN r.status = 'submitted' THEN 1 END),
		       COUNT(CASE WHEN r.status = 'under_review' THEN 1 END),
		       COUNT(CASE WHEN r.status = 'revision_required' THEN 1 END),
		       COUNT(CASE WHEN r.status IN ('approved', 'completed') THEN 1 END)
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		WHERE COALESCE(s.category, 'public') = 'public'
	`).Scan(
		&stats.Masyarakat.TotalRequests,
		&stats.Masyarakat.NeedAction,
		&stats.Masyarakat.Stats.Submitted,
		&stats.Masyarakat.Stats.UnderReview,
		&stats.Masyarakat.Stats.Revision,
		&stats.Masyarakat.Stats.Finished,
	)

	// 4. Stat Pengajuan Pegawai (category = 'asn')
	r.db.QueryRow(ctx, `
		SELECT COUNT(*),
		       COUNT(CASE WHEN r.status IN ('submitted', 'under_review') THEN 1 END),
		       COUNT(CASE WHEN r.status = 'submitted' THEN 1 END),
		       COUNT(CASE WHEN r.status = 'under_review' THEN 1 END),
		       COUNT(CASE WHEN r.status = 'revision_required' THEN 1 END),
		       COUNT(CASE WHEN r.status IN ('approved', 'completed') THEN 1 END)
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		WHERE COALESCE(s.category, 'public') = 'asn'
	`).Scan(
		&stats.Pegawai.TotalRequests,
		&stats.Pegawai.NeedAction,
		&stats.Pegawai.Stats.Submitted,
		&stats.Pegawai.Stats.UnderReview,
		&stats.Pegawai.Stats.Revision,
		&stats.Pegawai.Stats.Finished,
	)

	// 5. Global Summary Stats
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests`).Scan(&stats.Requests.Total)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests WHERE status = 'submitted'`).Scan(&stats.Requests.Pending)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests WHERE status = 'approved'`).Scan(&stats.Requests.Approved)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests WHERE status = 'completed'`).Scan(&stats.Requests.Completed)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests WHERE status = 'rejected'`).Scan(&stats.Requests.Rejected)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_feedbacks`).Scan(&stats.Feedbacks.Total)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_feedbacks WHERE status = 'pending'`).Scan(&stats.Feedbacks.Pending)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_appointments`).Scan(&stats.Appointments.Total)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_appointments WHERE status = 'pending'`).Scan(&stats.Appointments.Pending)
	r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_guest_book`).Scan(&stats.GuestBook.Total)

	return &stats, nil
}

