package repository

import (
	"context"
	"crypto/rand"
	"fmt"
	"strconv"
	"strings"
	"sync"
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
		       COALESCE(NULLIF(pm.nama, ''), NULLIF(pp.nama, ''), NULLIF(pt.nama, ''), 'Pemohon'),
		       COALESCE(NULLIF(pm.email, ''), NULLIF(pp.email, ''), NULLIF(pt.email, ''), '')
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.ptsp_service_items si ON si.id = r.service_item_id
		LEFT JOIN kemenag_ptsp.profiles_pemohon pm ON pm.user_id = r.user_id OR pm.id = r.user_id
		LEFT JOIN kemenag_ptsp.profiles_pegawai pp ON pp.user_id = r.user_id OR pp.id = r.user_id
		LEFT JOIN kemenag_ptsp.profiles_petugas pt ON pt.user_id = r.user_id OR pt.id = r.user_id
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

			req.GeneratedDocuments = []models.RequestDocument{}
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
		       COALESCE(NULLIF(pm.nama, ''), NULLIF(pp.nama, ''), NULLIF(pt.nama, ''), 'Pemohon'),
		       COALESCE(NULLIF(pm.email, ''), NULLIF(pp.email, ''), NULLIF(pt.email, ''), '')
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.ptsp_service_items si ON si.id = r.service_item_id
		LEFT JOIN kemenag_ptsp.profiles_pemohon pm ON pm.user_id = r.user_id OR pm.id = r.user_id
		LEFT JOIN kemenag_ptsp.profiles_pegawai pp ON pp.user_id = r.user_id OR pp.id = r.user_id
		LEFT JOIN kemenag_ptsp.profiles_petugas pt ON pt.user_id = r.user_id OR pt.id = r.user_id
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

	// Inisialisasi slice kosong agar JSON output valid array
	detail.Answers = []models.RequestAnswer{}
	detail.ServiceRequestAnswers = []models.RequestAnswer{}
	detail.Documents = []models.RequestDocument{}
	detail.ServiceRequestDocuments = []models.RequestDocument{}
	detail.GeneratedDocuments = []models.RequestDocument{}
	detail.Reviews = []models.RequestReview{}
	detail.ActivityLogs = []models.ActivityLog{}

	var wg sync.WaitGroup
	var mu sync.Mutex

	// 1. Fetch answers (paralel)
	wg.Add(1)
	go func() {
		defer wg.Done()
		aRows, err := r.db.Query(ctx, `
			SELECT 
				a.field_id,
				COALESCE(NULLIF(ff.label, ''), NULLIF(a.field_name, ''), 'Formulir'), 
				COALESCE(a.field_value, '') 
			FROM kemenag_ptsp.ptsp_service_request_answers a
			LEFT JOIN kemenag_ptsp.ptsp_service_form_fields ff ON ff.id = a.field_id OR ff.name = a.field_name
			WHERE a.request_id::text = $1 
			ORDER BY COALESCE(ff.sort_order, 999), a.created_at ASC
		`, detail.ID)
		if err == nil && aRows != nil {
			defer aRows.Close()
			var answers []models.RequestAnswer
			for aRows.Next() {
				var ans models.RequestAnswer
				var fid *int64
				if err := aRows.Scan(&fid, &ans.FieldName, &ans.FieldValue); err == nil {
					ans.FieldID = fid
					answers = append(answers, ans)
				}
			}
			mu.Lock()
			detail.Answers = answers
			detail.ServiceRequestAnswers = answers
			mu.Unlock()
		}
	}()

	// 2. Fetch requirements & uploaded documents (paralel)
	type reqItem struct {
		ID         int64
		Name       string
		IsRequired bool
	}
	var requirements []reqItem
	uploadedMap := make(map[int64]models.RequestDocument)
	var extraDocs []models.RequestDocument
	var docsWg sync.WaitGroup
	docsWg.Add(2)

	go func() {
		defer docsWg.Done()
		if detail.ServiceItemID > 0 {
			rRows, err := r.db.Query(ctx, `
				SELECT id, COALESCE(document_name, ''), is_required
				FROM kemenag_ptsp.ptsp_service_requirements
				WHERE service_item_id = $1
				ORDER BY sort_order ASC, id ASC
			`, detail.ServiceItemID)
			if err == nil && rRows != nil {
				defer rRows.Close()
				for rRows.Next() {
					var ri reqItem
					if err := rRows.Scan(&ri.ID, &ri.Name, &ri.IsRequired); err == nil {
						requirements = append(requirements, ri)
					}
				}
			}
		}
	}()

	go func() {
		defer docsWg.Done()
		docRows, err := r.db.Query(ctx, `
			SELECT d.id::text, d.requirement_id, COALESCE(sr.document_name, ''), COALESCE(d.file_name, ''), COALESCE(d.file_path, ''), COALESCE(d.file_type, ''), COALESCE(d.file_size, 0)
			FROM kemenag_ptsp.ptsp_service_request_documents d
			LEFT JOIN kemenag_ptsp.ptsp_service_requirements sr ON sr.id = d.requirement_id
			WHERE d.request_id::text = $1
		`, detail.ID)
		if err == nil && docRows != nil {
			defer docRows.Close()
			for docRows.Next() {
				var doc models.RequestDocument
				var reqID *int64
				if err := docRows.Scan(&doc.ID, &reqID, &doc.RequirementName, &doc.FileName, &doc.FilePath, &doc.FileType, &doc.FileSize); err == nil {
					doc.RequirementID = reqID
					if reqID != nil {
						uploadedMap[*reqID] = doc
					} else {
						extraDocs = append(extraDocs, doc)
					}
				}
			}
		}
	}()

	// 3. Fetch generated documents (paralel)
	wg.Add(1)
	go func() {
		defer wg.Done()
		genRows, err := r.db.Query(ctx, `
			SELECT id::text, COALESCE(file_name, ''), COALESCE(file_path, ''), 'pdf', 0
			FROM kemenag_ptsp.ptsp_generated_documents
			WHERE request_id::text = $1
			ORDER BY created_at DESC
		`, detail.ID)
		if err == nil && genRows != nil {
			defer genRows.Close()
			var genDocs []models.RequestDocument
			for genRows.Next() {
				var gDoc models.RequestDocument
				if err := genRows.Scan(&gDoc.ID, &gDoc.FileName, &gDoc.FilePath, &gDoc.FileType, &gDoc.FileSize); err == nil {
					genDocs = append(genDocs, gDoc)
				}
			}
			mu.Lock()
			detail.GeneratedDocuments = genDocs
			mu.Unlock()
		}
	}()

	// 4. Fetch reviews (paralel)
	wg.Add(1)
	go func() {
		defer wg.Done()
		reviewRows, err := r.db.Query(ctx, `
			SELECT rr.id::text, rr.status::text, COALESCE(rr.notes, ''), rr.created_at, COALESCE(pt.nama, COALESCE(p.nama, 'Petugas PTSP'))
			FROM kemenag_ptsp.ptsp_service_request_reviews rr
			LEFT JOIN kemenag_ptsp.profiles_petugas pt ON pt.user_id = rr.reviewer_id OR pt.id = rr.reviewer_id
			LEFT JOIN kemenag_ptsp.profiles_pegawai p ON p.user_id = rr.reviewer_id OR p.id = rr.reviewer_id
			WHERE rr.request_id::text = $1 ORDER BY rr.created_at DESC
		`, detail.ID)
		if err == nil && reviewRows != nil {
			defer reviewRows.Close()
			var revs []models.RequestReview
			for reviewRows.Next() {
				var rev models.RequestReview
				if err := reviewRows.Scan(&rev.ID, &rev.Action, &rev.Note, &rev.CreatedAt, &rev.ReviewerName); err == nil {
					revs = append(revs, rev)
				}
			}
			mu.Lock()
			detail.Reviews = revs
			mu.Unlock()
		}
	}()

	// 5. Fetch activity logs (paralel)
	wg.Add(1)
	go func() {
		defer wg.Done()
		actRows, err := r.db.Query(ctx, `
			SELECT id::text, action, COALESCE(actor_name, 'Admin PTSP'), COALESCE(notes, ''), created_at
			FROM kemenag_ptsp.ptsp_service_request_activity_logs
			WHERE request_id::text = $1
			ORDER BY created_at DESC LIMIT 50
		`, detail.ID)
		var logs []models.ActivityLog
		if err == nil && actRows != nil {
			defer actRows.Close()
			for actRows.Next() {
				var log models.ActivityLog
				var notes string
				if err := actRows.Scan(&log.ID, &log.Action, &log.ActorName, &notes, &log.CreatedAt); err == nil {
					if notes != "" && !strings.Contains(log.Action, notes) {
						log.Action += " — " + notes
					}
					logs = append(logs, log)
				}
			}
		}
		if len(logs) == 0 {
			logRows, err := r.db.Query(ctx, `
				SELECT id::text, COALESCE(action, ''), 'Admin PTSP', created_at
				FROM kemenag_ptsp.ptsp_audit_logs
				WHERE entity_id = $1 ORDER BY created_at DESC LIMIT 50
			`, detail.ID)
			if err == nil && logRows != nil {
				defer logRows.Close()
				for logRows.Next() {
					var log models.ActivityLog
					if err := logRows.Scan(&log.ID, &log.Action, &log.ActorName, &log.CreatedAt); err == nil {
						logs = append(logs, log)
					}
				}
			}
		}
		mu.Lock()
		detail.ActivityLogs = logs
		mu.Unlock()
	}()

	// Tunggu requirements & uploaded docs selesai diproses
	docsWg.Wait()
	var docs []models.RequestDocument
	for _, req := range requirements {
		reqIDVal := req.ID
		if doc, found := uploadedMap[req.ID]; found {
			doc.RequirementID = &reqIDVal
			doc.IsRequired = req.IsRequired
			if doc.RequirementName == "" {
				doc.RequirementName = req.Name
			}
			docs = append(docs, doc)
			delete(uploadedMap, req.ID)
		} else {
			docs = append(docs, models.RequestDocument{
				ID:              fmt.Sprintf("req-%d", req.ID),
				RequirementID:   &reqIDVal,
				RequirementName: req.Name,
				FileName:        "",
				FilePath:        "",
				FileType:        "",
				FileSize:        0,
				IsRequired:      req.IsRequired,
			})
		}
	}
	for _, doc := range uploadedMap {
		docs = append(docs, doc)
	}
	for _, doc := range extraDocs {
		docs = append(docs, doc)
	}
	detail.Documents = docs
	detail.ServiceRequestDocuments = docs

	// Tunggu seluruh query selesai
	wg.Wait()

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

	detail.ServiceRequestDocuments = detail.Documents
	detail.AltActivityLogs = detail.ActivityLogs

	return &detail, nil
}

func (r *RequestRepository) UpdateStatus(ctx context.Context, id string, req models.UpdateRequestStatusRequest) error {
	now := time.Now()
	status := strings.TrimSpace(req.Status)
	if status == "" {
		return fmt.Errorf("status tidak boleh kosong")
	}

	actorName := strings.TrimSpace(req.ReviewerName)
	if actorName == "" {
		actorName = strings.TrimSpace(req.AltReviewerName)
	}
	if actorName == "" {
		actorName = "Petugas PTSP"
	}

	reviewerIDStr := strings.TrimSpace(req.ReviewerID)
	if reviewerIDStr == "" {
		reviewerIDStr = strings.TrimSpace(req.AltReviewerID)
	}
	var reviewerID *string
	if reviewerIDStr != "" {
		reviewerID = &reviewerIDStr
	}

	// Klasifikasi catatan review secara akurat sesuai jenis status
	generalNote := strings.TrimSpace(req.Notes)
	revNote := strings.TrimSpace(req.RevisionNote)
	rejReason := strings.TrimSpace(req.RejectionReason)

	if revNote == "" && status == "revision_required" && generalNote != "" {
		revNote = generalNote
	}
	if rejReason == "" && status == "rejected" && generalNote != "" {
		rejReason = generalNote
	}

	noteForLog := generalNote
	if noteForLog == "" {
		if revNote != "" {
			noteForLog = revNote
		} else if rejReason != "" {
			noteForLog = rejReason
		}
	}

	// First get request UUID
	var requestUUID string
	err := r.db.QueryRow(ctx, `
		SELECT id::text FROM kemenag_ptsp.ptsp_service_requests
		WHERE id::text = $1 OR UPPER(request_number) = UPPER($1)
		LIMIT 1
	`, id).Scan(&requestUUID)
	if err != nil {
		return fmt.Errorf("permohonan tidak ditemukan: %w", err)
	}

	var approvedAt, rejectedAt, completedAt *time.Time
	switch status {
	case "approved":
		approvedAt = &now
	case "rejected":
		rejectedAt = &now
	case "completed":
		completedAt = &now
		approvedAt = &now
	}

	// Update status & timestamps
	_, err = r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.ptsp_service_requests
		SET status = $1,
		    revision_note = CASE 
		        WHEN $1 = 'revision_required' THEN NULLIF($2, '')
		        WHEN $1 IN ('approved', 'completed') THEN NULL
		        ELSE revision_note 
		    END,
		    rejection_reason = CASE 
		        WHEN $1 = 'rejected' THEN NULLIF($3, '')
		        WHEN $1 IN ('approved', 'completed') THEN NULL
		        ELSE rejection_reason 
		    END,
		    approved_at = CASE 
		        WHEN $1 IN ('approved', 'completed') THEN COALESCE(approved_at, $4)
		        WHEN $1 IN ('rejected', 'revision_required') THEN NULL
		        ELSE approved_at 
		    END,
		    rejected_at = CASE 
		        WHEN $1 = 'rejected' THEN COALESCE(rejected_at, $5)
		        ELSE NULL 
		    END,
		    completed_at = CASE 
		        WHEN $1 = 'completed' THEN COALESCE(completed_at, $6)
		        ELSE NULL 
		    END,
		    updated_at = $7
		WHERE id = $8::uuid
	`, status, revNote, rejReason, approvedAt, rejectedAt, completedAt, now, requestUUID)

	if err != nil {
		return err
	}

	// Insert into ptsp_service_request_reviews
	r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_request_reviews (request_id, reviewer_id, status, notes, created_at)
		VALUES ($1::uuid, $2::uuid, $3::kemenag_ptsp.ptsp_request_status, NULLIF($4, ''), $5)
	`, requestUUID, reviewerID, status, noteForLog, now)

	// Insert into ptsp_service_request_activity_logs
	logAction := fmt.Sprintf("Status permohonan diubah menjadi %s", strings.ToUpper(status))
	r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_request_activity_logs (request_id, action, actor_name, notes, created_at)
		VALUES ($1::uuid, $2, $3, NULLIF($4, ''), $5)
	`, requestUUID, logAction, actorName, noteForLog, now)

	// Insert into ptsp_audit_logs as well
	r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_audit_logs (action, entity_type, entity_id, details, created_at)
		VALUES ($1, 'service_request', $2, jsonb_build_object('status', $3, 'notes', $4, 'reviewer', $5), $6)
	`, logAction, requestUUID, status, noteForLog, actorName, now)

	// Sinkronisasi otomatis dengan permohonan Cuti ASN jika terkait
	r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.ptsp_pengajuan_cuti
		SET status = CASE 
		        WHEN $1 = 'approved' THEN 'disetujui'
		        WHEN $1 = 'completed' THEN 'selesai'
		        WHEN $1 = 'rejected' THEN 'ditolak'
		        WHEN $1 = 'revision_required' THEN 'perlu_revisi'
		        WHEN $1 = 'under_review' THEN 'diproses'
		        WHEN $1 = 'spam' THEN 'ditolak'
		        ELSE status 
		    END,
		    status_kepala = CASE 
		        WHEN $1 = 'approved' THEN 'disetujui'
		        WHEN $1 = 'completed' THEN 'disetujui'
		        WHEN $1 = 'rejected' THEN 'ditolak'
		        WHEN $1 = 'spam' THEN 'ditolak'
		        ELSE status_kepala 
		    END,
		    status_atasan = CASE
		        WHEN $1 IN ('approved', 'completed') AND (status_atasan IS NULL OR status_atasan = 'menunggu') THEN 'disetujui'
		        ELSE status_atasan
		    END,
		    catatan_kepala = CASE 
		        WHEN NULLIF($2, '') IS NOT NULL THEN $2 
		        ELSE catatan_kepala 
		    END,
		    updated_at = $3
		WHERE request_id = $4::uuid
	`, status, noteForLog, now, requestUUID)

	return nil
}

// GetFilePathsByRequestID mengambil seluruh URL/path berkas dokumen yang terhubung dengan permohonan ini untuk dihapus dari Cloudflare R2 / lokal
// GetFilePathsByRequestID mengambil seluruh URL/path berkas dokumen yang terhubung dengan permohonan ini dalam 1 query UNION cepat
func (r *RequestRepository) GetFilePathsByRequestID(ctx context.Context, id string) ([]string, error) {
	var paths []string
	rows, err := r.db.Query(ctx, `
		WITH target_req AS (
			SELECT id::text FROM kemenag_ptsp.ptsp_service_requests 
			WHERE id::text = $1 OR UPPER(request_number) = UPPER($1) 
			LIMIT 1
		)
		SELECT file_path FROM kemenag_ptsp.ptsp_service_request_documents
		WHERE request_id::text IN (SELECT id::text FROM target_req) AND file_path IS NOT NULL AND file_path <> ''
		UNION ALL
		SELECT file_path FROM kemenag_ptsp.ptsp_generated_documents
		WHERE request_id::text IN (SELECT id::text FROM target_req) AND file_path IS NOT NULL AND file_path <> ''
		UNION ALL
		SELECT dokumen_url FROM kemenag_ptsp.ptsp_pengajuan_cuti
		WHERE request_id::text IN (SELECT id::text FROM target_req) AND dokumen_url IS NOT NULL AND dokumen_url <> ''
	`, id)
	if err != nil {
		return paths, nil
	}
	defer rows.Close()

	for rows.Next() {
		var p string
		if err := rows.Scan(&p); err == nil && p != "" {
			paths = append(paths, p)
		}
	}
	return paths, nil
}

func (r *RequestRepository) Delete(ctx context.Context, id string) error {
	// Hapus dalam 1 query transaksi cepat: relasi cuti & request utama (men-cascade seluruh relasi tabel anak)
	_, err := r.db.Exec(ctx, `
		WITH target_req AS (
			SELECT id FROM kemenag_ptsp.ptsp_service_requests 
			WHERE id::text = $1 OR UPPER(request_number) = UPPER($1)
			LIMIT 1
		),
		del_cuti AS (
			DELETE FROM kemenag_ptsp.ptsp_pengajuan_cuti 
			WHERE request_id IN (SELECT id FROM target_req)
		)
		DELETE FROM kemenag_ptsp.ptsp_service_requests 
		WHERE id IN (SELECT id FROM target_req)
	`, id)
	return err
}

func (r *RequestRepository) GetDashboardStats(ctx context.Context) (*models.DashboardStats, error) {
	var stats models.DashboardStats

	const query = `
		SELECT
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_services WHERE is_active = true AND COALESCE(category, 'public') = 'public'),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_services WHERE is_active = true AND COALESCE(category, 'public') = 'asn'),
			(SELECT COUNT(*) FROM kemenag_ptsp.profiles_pemohon),
			(SELECT COUNT(*) FROM kemenag_ptsp.profiles_pegawai),
			COALESCE(m.total, 0),
			COALESCE(m.need_action, 0),
			COALESCE(m.submitted, 0),
			COALESCE(m.under_review, 0),
			COALESCE(m.revision, 0),
			COALESCE(m.finished, 0),
			COALESCE(p.total, 0),
			COALESCE(p.need_action, 0),
			COALESCE(p.submitted, 0),
			COALESCE(p.under_review, 0),
			COALESCE(p.revision, 0),
			COALESCE(p.finished, 0),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests WHERE status = 'submitted'),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests WHERE status = 'approved'),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests WHERE status = 'completed'),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_service_requests WHERE status = 'rejected'),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_feedbacks),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_feedbacks WHERE status = 'pending'),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_appointments),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_appointments WHERE status = 'pending'),
			(SELECT COUNT(*) FROM kemenag_ptsp.ptsp_guest_book)
		FROM (
			SELECT
				COUNT(*) AS total,
				COUNT(CASE WHEN r.status IN ('submitted', 'under_review') THEN 1 END) AS need_action,
				COUNT(CASE WHEN r.status = 'submitted' THEN 1 END) AS submitted,
				COUNT(CASE WHEN r.status = 'under_review' THEN 1 END) AS under_review,
				COUNT(CASE WHEN r.status = 'revision_required' THEN 1 END) AS revision,
				COUNT(CASE WHEN r.status IN ('approved', 'completed') THEN 1 END) AS finished
			FROM kemenag_ptsp.ptsp_service_requests r
			LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
			WHERE COALESCE(s.category, 'public') = 'public'
		) m
		CROSS JOIN (
			SELECT
				COUNT(*) AS total,
				COUNT(CASE WHEN r.status IN ('submitted', 'under_review') THEN 1 END) AS need_action,
				COUNT(CASE WHEN r.status = 'submitted' THEN 1 END) AS submitted,
				COUNT(CASE WHEN r.status = 'under_review' THEN 1 END) AS under_review,
				COUNT(CASE WHEN r.status = 'revision_required' THEN 1 END) AS revision,
				COUNT(CASE WHEN r.status IN ('approved', 'completed') THEN 1 END) AS finished
			FROM kemenag_ptsp.ptsp_service_requests r
			LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
			WHERE COALESCE(s.category, 'public') = 'asn'
		) p
	`

	err := r.db.QueryRow(ctx, query).Scan(
		&stats.Masyarakat.ServiceCount,
		&stats.Pegawai.ServiceCount,
		&stats.Masyarakat.UserCount,
		&stats.Pegawai.UserCount,
		&stats.Masyarakat.TotalRequests,
		&stats.Masyarakat.NeedAction,
		&stats.Masyarakat.Stats.Submitted,
		&stats.Masyarakat.Stats.UnderReview,
		&stats.Masyarakat.Stats.Revision,
		&stats.Masyarakat.Stats.Finished,
		&stats.Pegawai.TotalRequests,
		&stats.Pegawai.NeedAction,
		&stats.Pegawai.Stats.Submitted,
		&stats.Pegawai.Stats.UnderReview,
		&stats.Pegawai.Stats.Revision,
		&stats.Pegawai.Stats.Finished,
		&stats.Requests.Total,
		&stats.Requests.Pending,
		&stats.Requests.Approved,
		&stats.Requests.Completed,
		&stats.Requests.Rejected,
		&stats.Feedbacks.Total,
		&stats.Feedbacks.Pending,
		&stats.Appointments.Total,
		&stats.Appointments.Pending,
		&stats.GuestBook.Total,
	)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}


// InsertDocument menyimpan record dokumen unggahan revisi pada sebuah permohonan.
func (r *RequestRepository) InsertDocument(ctx context.Context, requestID, requirementID, fileName, filePath, fileType string, fileSize int64) error {
	var reqID *int64
	if requirementID != "" {
		if val, err := strconv.ParseInt(requirementID, 10, 64); err == nil {
			reqID = &val
		}
	}

	var requestUUID string
	err := r.db.QueryRow(ctx, `
		SELECT id::text FROM kemenag_ptsp.ptsp_service_requests
		WHERE id::text = $1 OR UPPER(request_number) = UPPER($1)
		LIMIT 1
	`, requestID).Scan(&requestUUID)
	if err != nil {
		requestUUID = requestID
	}

	_, err = r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_request_documents (request_id, requirement_id, file_name, file_path, file_type, file_size)
		VALUES ($1::uuid, $2, $3, $4, $5, $6)
	`, requestUUID, reqID, fileName, filePath, fileType, fileSize)
	if err != nil {
		return err
	}

	// Also log this upload activity
	docAction := fmt.Sprintf("Mengunggah dokumen: %s", fileName)
	r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_request_activity_logs (request_id, action, actor_name, created_at)
		VALUES ($1::uuid, $2, 'Pemohon', NOW())
	`, requestUUID, docAction)

	return nil
}

// Create membuat permohonan baru beserta jawaban form-nya, mengembalikan ID & nomor permohonan.
func (r *RequestRepository) Create(ctx context.Context, userID string, serviceID, serviceItemID int64, answers []models.RequestAnswer) (*models.ServiceRequest, error) {
	requestNumber := generateRequestNumber()

	var id string
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_requests (user_id, service_id, service_item_id, request_number, status)
		VALUES ($1::uuid, $2, $3, $4, 'submitted')
		RETURNING id::text
	`, userID, serviceID, serviceItemID, requestNumber).Scan(&id)
	if err != nil {
		return nil, err
	}

	for _, ans := range answers {
		if ans.FieldName == "" {
			continue
		}
		if _, err := r.db.Exec(ctx, `
			INSERT INTO kemenag_ptsp.ptsp_service_request_answers (request_id, field_id, field_name, field_value)
			VALUES ($1::uuid, $2, $3, $4)
		`, id, ans.FieldID, ans.FieldName, ans.FieldValue); err != nil {
			return nil, err
		}
	}

	return &models.ServiceRequest{
		ID:            id,
		UserID:        userID,
		ServiceID:     serviceID,
		ServiceItemID: serviceItemID,
		RequestNumber: requestNumber,
		Status:        "submitted",
	}, nil
}

// UpdateByApplicant memperbarui jawaban form & mengembalikan status ke submitted (edit oleh pemohon).
func (r *RequestRepository) UpdateByApplicant(ctx context.Context, id, userID string, answers []models.RequestAnswer) error {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM kemenag_ptsp.ptsp_service_requests WHERE id::text = $1 AND user_id::text = $2)
	`, id, userID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("permohonan tidak ditemukan")
	}

	if _, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_request_answers WHERE request_id::text = $1`, id); err != nil {
		return err
	}
	for _, ans := range answers {
		if ans.FieldName == "" {
			continue
		}
		if _, err := r.db.Exec(ctx, `
			INSERT INTO kemenag_ptsp.ptsp_service_request_answers (request_id, field_id, field_name, field_value)
			VALUES ($1::uuid, $2, $3, $4)
		`, id, ans.FieldID, ans.FieldName, ans.FieldValue); err != nil {
			return err
		}
	}

	_, err = r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.ptsp_service_requests SET status = 'submitted', submitted_at = NOW()
		WHERE id::text = $1 AND user_id::text = $2
	`, id, userID)
	return err
}

// DeleteByApplicant menghapus permohonan milik pemohon (beserta jawaban & dokumen terkait).
func (r *RequestRepository) DeleteByApplicant(ctx context.Context, id, userID string) error {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM kemenag_ptsp.ptsp_service_requests WHERE id::text = $1 AND user_id::text = $2)
	`, id, userID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("permohonan tidak ditemukan")
	}

	_, _ = r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_pengajuan_cuti WHERE request_id::text = $1`, id)
	if _, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_request_answers WHERE request_id::text = $1`, id); err != nil {
		return err
	}
	if _, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_request_documents WHERE request_id::text = $1`, id); err != nil {
		return err
	}
	_, err = r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_requests WHERE id::text = $1 AND user_id::text = $2`, id, userID)
	return err
}

// generateRequestNumber membuat nomor permohonan unik: REQ-YYYYMMDD-XXXXXX
func generateRequestNumber() string {
	now := time.Now()
	return fmt.Sprintf("REQ-%s-%s", now.Format("20060102"), strings.ToUpper(randomHex(6)))
}

func randomHex(n int) string {
	const hexChars = "0123456789ABCDEF"
	b := make([]byte, n)
	if _, err := rand.Read(b); err == nil {
		for i := range b {
			b[i] = hexChars[int(b[i])%len(hexChars)]
		}
		return string(b)
	}
	for i := range b {
		b[i] = hexChars[time.Now().UnixNano()%int64(len(hexChars))]
	}
	return string(b)
}

