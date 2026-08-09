package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"ptsp-kemenag-backend/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

// RequestRepository menangani operasi DB permohonan layanan (ptsp_service_requests) dan dashboard statistics.
type RequestRepository struct {
	db *pgxpool.Pool
}

func NewRequestRepository(db *pgxpool.Pool) *RequestRepository {
	return &RequestRepository{db: db}
}

func (r *RequestRepository) FindAll(ctx context.Context, userID, status, category string, limit int) ([]models.ServiceRequest, error) {
	query := `
		SELECT r.id, r.user_id, r.service_id, r.service_item_id, r.request_number, r.status,
		       r.submitted_at, r.approved_at, r.rejected_at, r.completed_at, r.created_at,
		       COALESCE(s.name, ''), COALESCE(si.name, ''),
		       COALESCE(p.name, 'Pemohon'), COALESCE(p.email, '')
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.ptsp_service_items si ON si.id = r.service_item_id
		LEFT JOIN kemenag_pusdatin.profiles p ON p.id = r.user_id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if userID != "" && userID != "undefined" {
		query += fmt.Sprintf(" AND r.user_id = $%d", argIdx)
		args = append(args, userID)
		argIdx++
	}
	if status != "" {
		statuses := strings.Split(status, ",")
		if len(statuses) == 1 {
			query += fmt.Sprintf(" AND r.status = $%d", argIdx)
			args = append(args, strings.TrimSpace(statuses[0]))
			argIdx++
		} else {
			placeholders := []string{}
			for _, st := range statuses {
				stTrimmed := strings.TrimSpace(st)
				if stTrimmed != "" {
					placeholders = append(placeholders, fmt.Sprintf("$%d", argIdx))
					args = append(args, stTrimmed)
					argIdx++
				}
			}
			if len(placeholders) > 0 {
				query += fmt.Sprintf(" AND r.status::text IN (%s)", strings.Join(placeholders, ", "))
			}
		}
	}
	switch category {
	case "public":
		query += " AND (s.category != 'asn' OR s.category IS NULL)"
	case "pegawai", "asn":
		query += " AND s.category = 'asn'"
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
		var sName, iName, aName, aEmail string
		if err := rows.Scan(&req.ID, &req.UserID, &req.ServiceID, &req.ServiceItemID, &req.RequestNumber, &req.Status,
			&req.SubmittedAt, &req.ApprovedAt, &req.RejectedAt, &req.CompletedAt, &req.CreatedAt, &sName, &iName,
			&aName, &aEmail); err == nil {
			req.ServiceName = &sName
			req.ItemName = &iName
			req.ApplicantName = &aName
			req.ApplicantEmail = &aEmail
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
	var serviceName, roleOwner, category, itemName, applicantName, applicantEmail string

	err := r.db.QueryRow(ctx, `
		SELECT r.id, r.user_id, r.service_id, r.service_item_id, r.request_number, r.status,
		       r.submitted_at, r.approved_at, r.rejected_at, r.completed_at, r.created_at,
		       r.revision_note, r.rejection_reason,
		       COALESCE(s.name, ''), COALESCE(s.role_owner, ''), COALESCE(s.category, 'public'),
		       COALESCE(si.name, ''),
		       COALESCE(p.name, ''), COALESCE(p.email, '')
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.ptsp_service_items si ON si.id = r.service_item_id
		LEFT JOIN kemenag_pusdatin.profiles p ON p.id = r.user_id
		WHERE r.id::text = $1 OR UPPER(r.request_number) = UPPER($1)
		LIMIT 1
	`, id).Scan(&detail.ID, &detail.UserID, &detail.ServiceID, &detail.ServiceItemID, &detail.RequestNumber, &detail.Status,
		&detail.SubmittedAt, &detail.ApprovedAt, &detail.RejectedAt, &detail.CompletedAt, &detail.CreatedAt,
		&detail.RevisionNote, &detail.RejectionReason,
		&serviceName, &roleOwner, &category,
		&itemName,
		&applicantName, &applicantEmail)

	if err != nil {
		return nil, err
	}

	detail.ServiceName = &serviceName
	detail.RoleOwner = roleOwner
	detail.Category = category
	detail.ItemName = &itemName
	detail.ApplicantName = &applicantName
	detail.ApplicantEmail = &applicantEmail

	// Fetch answers
	answerRows, _ := r.db.Query(ctx, `SELECT field_name, COALESCE(field_value, '') FROM kemenag_ptsp.ptsp_service_request_answers WHERE request_id::text = $1 ORDER BY created_at ASC`, id)
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
	docRows, _ := r.db.Query(ctx, `SELECT id::text, COALESCE(file_name, ''), COALESCE(file_path, ''), COALESCE(file_type, ''), COALESCE(file_size, 0) FROM kemenag_ptsp.ptsp_service_request_documents WHERE request_id::text = $1`, id)
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
		SELECT rr.id::text, rr.action, COALESCE(rr.note, ''), rr.created_at, COALESCE(p.name, '')
		FROM kemenag_ptsp.ptsp_service_request_reviews rr
		LEFT JOIN kemenag_pusdatin.profiles p ON p.id = rr.reviewer_id
		WHERE rr.request_id::text = $1 ORDER BY rr.created_at DESC
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
		WHERE request_id::text = $1 ORDER BY created_at DESC LIMIT 50
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

	// Synthesize milestone activity logs from database timestamps if not already present
	hasSubmitted := false
	hasApproved := false
	hasRejected := false
	hasCompleted := false

	for _, l := range detail.ActivityLogs {
		actLower := strings.ToLower(l.Action)
		if strings.Contains(actLower, "submit") || strings.Contains(actLower, "dikirim") {
			hasSubmitted = true
		}
		if strings.Contains(actLower, "approve") || strings.Contains(actLower, "disetujui") {
			hasApproved = true
		}
		if strings.Contains(actLower, "reject") || strings.Contains(actLower, "ditolak") {
			hasRejected = true
		}
		if strings.Contains(actLower, "complete") || strings.Contains(actLower, "selesai") {
			hasCompleted = true
		}
	}

	actor := "Admin PTSP"
	applicantActor := "Pemohon"
	if detail.ApplicantName != nil && *detail.ApplicantName != "" {
		applicantActor = *detail.ApplicantName
	}

	if !hasSubmitted {
		subTime := detail.CreatedAt
		if detail.SubmittedAt != nil {
			subTime = *detail.SubmittedAt
		}
		detail.ActivityLogs = append(detail.ActivityLogs, models.ActivityLog{
			ID:        "milestone-submitted-" + detail.ID,
			Action:    "submitted",
			ActorName: applicantActor,
			CreatedAt: subTime,
		})
	}

	if !hasApproved && detail.ApprovedAt != nil {
		detail.ActivityLogs = append(detail.ActivityLogs, models.ActivityLog{
			ID:        "milestone-approved-" + detail.ID,
			Action:    "status:approved",
			ActorName: actor,
			CreatedAt: *detail.ApprovedAt,
		})
	}

	if !hasRejected && detail.RejectedAt != nil {
		actionText := "status:rejected"
		if detail.RejectionReason != nil && *detail.RejectionReason != "" {
			actionText = fmt.Sprintf("status:rejected (Alasan: %s)", *detail.RejectionReason)
		}
		detail.ActivityLogs = append(detail.ActivityLogs, models.ActivityLog{
			ID:        "milestone-rejected-" + detail.ID,
			Action:    actionText,
			ActorName: actor,
			CreatedAt: *detail.RejectedAt,
		})
	}

	if !hasCompleted && detail.CompletedAt != nil {
		detail.ActivityLogs = append(detail.ActivityLogs, models.ActivityLog{
			ID:        "milestone-completed-" + detail.ID,
			Action:    "status:completed",
			ActorName: actor,
			CreatedAt: *detail.CompletedAt,
		})
	}

	// Also check if current status is "completed" or "approved" or "rejected" but timestamp wasn't set, use CreatedAt
	currentStatus := strings.ToLower(detail.Status)
	if (currentStatus == "completed" || currentStatus == "selesai") && !hasCompleted && detail.CompletedAt == nil {
		detail.ActivityLogs = append(detail.ActivityLogs, models.ActivityLog{
			ID:        "milestone-status-completed-" + detail.ID,
			Action:    "status:completed",
			ActorName: actor,
			CreatedAt: detail.CreatedAt,
		})
	}
	if (currentStatus == "approved" || currentStatus == "disetujui") && !hasApproved && detail.ApprovedAt == nil {
		detail.ActivityLogs = append(detail.ActivityLogs, models.ActivityLog{
			ID:        "milestone-status-approved-" + detail.ID,
			Action:    "status:approved",
			ActorName: actor,
			CreatedAt: detail.CreatedAt,
		})
	}
	if (currentStatus == "rejected" || currentStatus == "ditolak") && !hasRejected && detail.RejectedAt == nil {
		detail.ActivityLogs = append(detail.ActivityLogs, models.ActivityLog{
			ID:        "milestone-status-rejected-" + detail.ID,
			Action:    "status:rejected",
			ActorName: actor,
			CreatedAt: detail.CreatedAt,
		})
	}

	return &detail, nil
}

func (r *RequestRepository) UpdateStatus(ctx context.Context, id string, req models.UpdateRequestStatusRequest) error {
	now := time.Now()
	note := strings.TrimSpace(req.RevisionNote)
	if note == "" {
		note = strings.TrimSpace(req.RejectionReason)
	}

	status := strings.TrimSpace(req.Status)
	if status == "" {
		return fmt.Errorf("status tidak boleh kosong")
	}

	var approvedAt, rejectedAt, completedAt *time.Time
	switch status {
	case "approved":
		approvedAt = &now
	case "rejected":
		rejectedAt = &now
	case "completed":
		completedAt = &now
	}

	_, err := r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.ptsp_service_requests
		SET status = $1,
		    revision_note = CASE WHEN $2 <> '' THEN $2 ELSE revision_note END,
		    rejection_reason = CASE WHEN $3 <> '' THEN $3 ELSE rejection_reason END,
		    approved_at = COALESCE($4, approved_at),
		    rejected_at = COALESCE($5, rejected_at),
		    completed_at = COALESCE($6, completed_at),
		    updated_at = $7
		WHERE id::text = $8 OR request_number = $8
	`, status, note, note, approvedAt, rejectedAt, completedAt, now, id)

	if err != nil {
		return err
	}

	// Insert Activity Log for timeline history
	logAction := fmt.Sprintf("Status permohonan diubah menjadi %s", strings.ToUpper(status))
	if note != "" {
		logAction += fmt.Sprintf(" (Catatan: %s)", note)
	}
	r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_request_activity_logs (request_id, action, actor_name, created_at)
		SELECT r.id, $1, 'Admin PTSP', $2
		FROM kemenag_ptsp.ptsp_service_requests r
		WHERE r.id::text = $3 OR r.request_number = $3
		LIMIT 1
	`, logAction, now, id)

	return nil
}

func (r *RequestRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_requests WHERE id::text = $1 OR request_number = $1`, id)
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

