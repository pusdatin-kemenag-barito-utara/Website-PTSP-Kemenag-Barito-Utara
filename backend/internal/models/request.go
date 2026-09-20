package models

import (
	"encoding/json"
	"time"
)

// ServiceRequest merepresentasikan pengajuan layanan oleh pemohon.
type ServiceRequest struct {
	ID              string     `json:"id"`
	UserID          string     `json:"user_id"`
	ServiceID       int64      `json:"service_id"`
	ServiceItemID   int64      `json:"service_item_id"`
	RequestNumber   string     `json:"request_number"`
	Status          string     `json:"status"`
	SubmittedAt     *time.Time `json:"submitted_at"`
	ApprovedAt      *time.Time `json:"approved_at"`
	RejectedAt      *time.Time `json:"rejected_at"`
	CompletedAt     *time.Time `json:"completed_at"`
	RevisionNote    *string    `json:"revision_note"`
	RejectionReason *string    `json:"rejection_reason"`
	CreatedAt       time.Time  `json:"created_at"`
	// Joined fields
	ServiceName    *string `json:"service_name,omitempty"`
	ItemName       *string `json:"item_name,omitempty"`
	ApplicantName  *string `json:"applicant_name,omitempty"`
	ApplicantEmail *string           `json:"applicant_email,omitempty"`
	RoleOwner      string            `json:"role_owner,omitempty"`
	Category       string            `json:"category,omitempty"`
	GeneratedDocuments []RequestDocument `json:"generatedDocuments"`
}

func (r ServiceRequest) MarshalJSON() ([]byte, error) {
	type Alias ServiceRequest
	return json.Marshal(&struct {
		Alias
		AltRequestNumber   string     `json:"requestNumber"`
		AltUserID          string     `json:"userId"`
		AltServiceID       int64      `json:"serviceId"`
		AltServiceItemID   int64      `json:"serviceItemId"`
		AltServiceName     *string    `json:"serviceName,omitempty"`
		AltItemName        *string    `json:"itemName,omitempty"`
		AltApplicantName   *string    `json:"applicantName,omitempty"`
		AltApplicantEmail  *string    `json:"applicantEmail,omitempty"`
		AltSubmittedAt     *time.Time `json:"submittedAt,omitempty"`
		AltApprovedAt      *time.Time `json:"approvedAt,omitempty"`
		AltRejectedAt      *time.Time `json:"rejectedAt,omitempty"`
		AltCompletedAt     *time.Time `json:"completedAt,omitempty"`
		AltRevisionNote    *string    `json:"revisionNote,omitempty"`
		AltRejectionReason *string    `json:"rejectionReason,omitempty"`
		AltCreatedAt       time.Time  `json:"createdAt"`
	}{
		Alias:              Alias(r),
		AltRequestNumber:   r.RequestNumber,
		AltUserID:          r.UserID,
		AltServiceID:       r.ServiceID,
		AltServiceItemID:   r.ServiceItemID,
		AltServiceName:     r.ServiceName,
		AltItemName:        r.ItemName,
		AltApplicantName:   r.ApplicantName,
		AltApplicantEmail:  r.ApplicantEmail,
		AltSubmittedAt:     r.SubmittedAt,
		AltApprovedAt:      r.ApprovedAt,
		AltRejectedAt:      r.RejectedAt,
		AltCompletedAt:     r.CompletedAt,
		AltRevisionNote:    r.RevisionNote,
		AltRejectionReason: r.RejectionReason,
		AltCreatedAt:       r.CreatedAt,
	})
}

// RequestAnswer merepresentasikan jawaban form pengajuan.
type RequestAnswer struct {
	FieldID    *int64 `json:"field_id,omitempty"`
	FieldName  string `json:"field_name"`
	FieldValue string `json:"field_value"`
}

func (a *RequestAnswer) UnmarshalJSON(data []byte) error {
	type Alias RequestAnswer
	var aux struct {
		Alias
		AltFieldID    *int64 `json:"fieldId"`
		AltFieldName  string `json:"fieldName"`
		AltFieldValue string `json:"fieldValue"`
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	*a = RequestAnswer(aux.Alias)
	if a.FieldID == nil && aux.AltFieldID != nil {
		a.FieldID = aux.AltFieldID
	}
	if a.FieldName == "" && aux.AltFieldName != "" {
		a.FieldName = aux.AltFieldName
	}
	if a.FieldValue == "" && aux.AltFieldValue != "" {
		a.FieldValue = aux.AltFieldValue
	}
	return nil
}

func (a RequestAnswer) MarshalJSON() ([]byte, error) {
	type Alias RequestAnswer
	return json.Marshal(&struct {
		Alias
		AltFieldID    *int64 `json:"fieldId,omitempty"`
		AltFieldName  string `json:"fieldName"`
		AltFieldValue string `json:"fieldValue"`
	}{
		Alias:         Alias(a),
		AltFieldID:    a.FieldID,
		AltFieldName:  a.FieldName,
		AltFieldValue: a.FieldValue,
	})
}

// RequestDocument merepresentasikan dokumen yang diunggah untuk pengajuan.
type RequestDocument struct {
	ID              string `json:"id"`
	RequirementID   *int64 `json:"requirement_id,omitempty"`
	RequirementName string `json:"requirement_name,omitempty"`
	IsRequired      bool   `json:"is_required"`
	FileName        string `json:"file_name"`
	FilePath        string `json:"file_path"`
	FileType        string `json:"file_type"`
	FileSize        int64  `json:"file_size"`
}

func (d RequestDocument) MarshalJSON() ([]byte, error) {
	type Alias RequestDocument
	return json.Marshal(&struct {
		Alias
		AltRequirementID   *int64 `json:"requirementId,omitempty"`
		AltRequirementName string `json:"requirementName,omitempty"`
		AltIsRequired      bool   `json:"isRequired"`
		AltFileName        string `json:"fileName"`
		AltFilePath        string `json:"filePath"`
		AltFileType        string `json:"fileType"`
		AltFileSize        int64  `json:"fileSize"`
	}{
		Alias:              Alias(d),
		AltRequirementID:   d.RequirementID,
		AltRequirementName: d.RequirementName,
		AltIsRequired:      d.IsRequired,
		AltFileName:        d.FileName,
		AltFilePath:        d.FilePath,
		AltFileType:        d.FileType,
		AltFileSize:        d.FileSize,
	})
}

// RequestReview merepresentasikan review/approval dari admin.
type RequestReview struct {
	ID           string    `json:"id"`
	Action       string    `json:"action"`
	Note         string    `json:"note"`
	CreatedAt    time.Time `json:"created_at"`
	ReviewerName string    `json:"reviewer_name"`
}

// ActivityLog merepresentasikan log aktivitas permohonan.
type ActivityLog struct {
	ID        string    `json:"id"`
	Action    string    `json:"action"`
	ActorName string    `json:"actor_name"`
	CreatedAt time.Time `json:"created_at"`
}

func (l ActivityLog) MarshalJSON() ([]byte, error) {
	type Alias ActivityLog
	return json.Marshal(&struct {
		Alias
		AltActorName string    `json:"actorName"`
		AltCreatedAt time.Time `json:"createdAt"`
	}{
		Alias:        Alias(l),
		AltActorName: l.ActorName,
		AltCreatedAt: l.CreatedAt,
	})
}

// ServiceRequestDetail adalah detail lengkap pengajuan (admin & masyarakat view).
type ServiceRequestDetail struct {
	ServiceRequest
	Answers                 []RequestAnswer   `json:"answers"`
	ServiceRequestAnswers   []RequestAnswer   `json:"serviceRequestAnswers"`
	Documents               []RequestDocument `json:"documents"`
	ServiceRequestDocuments []RequestDocument `json:"serviceRequestDocuments"`
	Reviews                 []RequestReview   `json:"reviews"`
	ActivityLogs            []ActivityLog     `json:"activityLogs"`
	AltActivityLogs         []ActivityLog     `json:"activity_logs"`
}

func (d ServiceRequestDetail) MarshalJSON() ([]byte, error) {
	type SR ServiceRequest
	return json.Marshal(&struct {
		SR
		AltRequestNumber        string            `json:"requestNumber"`
		AltUserID               string            `json:"userId"`
		AltServiceID            int64             `json:"serviceId"`
		AltServiceItemID        int64             `json:"serviceItemId"`
		AltServiceName          *string           `json:"serviceName,omitempty"`
		AltItemName             *string           `json:"itemName,omitempty"`
		AltApplicantName        *string           `json:"applicantName,omitempty"`
		AltApplicantEmail       *string           `json:"applicantEmail,omitempty"`
		AltSubmittedAt          *time.Time        `json:"submittedAt,omitempty"`
		AltApprovedAt           *time.Time        `json:"approvedAt,omitempty"`
		AltRejectedAt           *time.Time        `json:"rejectedAt,omitempty"`
		AltCompletedAt          *time.Time        `json:"completedAt,omitempty"`
		AltRevisionNote         *string           `json:"revisionNote,omitempty"`
		AltRejectionReason      *string           `json:"rejectionReason,omitempty"`
		AltCreatedAt            time.Time         `json:"createdAt"`
		Answers                 []RequestAnswer   `json:"answers"`
		ServiceRequestAnswers   []RequestAnswer   `json:"serviceRequestAnswers"`
		Documents               []RequestDocument `json:"documents"`
		ServiceRequestDocuments []RequestDocument `json:"serviceRequestDocuments"`
		Reviews                 []RequestReview   `json:"reviews"`
		ActivityLogs            []ActivityLog     `json:"activityLogs"`
		AltActivityLogs         []ActivityLog     `json:"activity_logs"`
	}{
		SR:                      SR(d.ServiceRequest),
		AltRequestNumber:        d.RequestNumber,
		AltUserID:               d.UserID,
		AltServiceID:            d.ServiceID,
		AltServiceItemID:        d.ServiceItemID,
		AltServiceName:          d.ServiceName,
		AltItemName:             d.ItemName,
		AltApplicantName:        d.ApplicantName,
		AltApplicantEmail:       d.ApplicantEmail,
		AltSubmittedAt:          d.SubmittedAt,
		AltApprovedAt:           d.ApprovedAt,
		AltRejectedAt:           d.RejectedAt,
		AltCompletedAt:          d.CompletedAt,
		AltRevisionNote:         d.RevisionNote,
		AltRejectionReason:      d.RejectionReason,
		AltCreatedAt:            d.CreatedAt,
		Answers:                 d.Answers,
		ServiceRequestAnswers:   d.ServiceRequestAnswers,
		Documents:               d.Documents,
		ServiceRequestDocuments: d.ServiceRequestDocuments,
		Reviews:                 d.Reviews,
		ActivityLogs:            d.ActivityLogs,
		AltActivityLogs:         d.AltActivityLogs,
	})
}

// UpdateRequestStatusRequest DTO untuk update status pengajuan.
type UpdateRequestStatusRequest struct {
	Status          string `json:"status"`
	RejectionReason string `json:"rejectionReason"`
	RevisionNote    string `json:"revisionNote"`
	Notes           string `json:"notes"`
	ReviewerID      string `json:"reviewerId"`
	AltReviewerID   string `json:"reviewer_id"`
	ReviewerName    string `json:"reviewerName"`
	AltReviewerName string `json:"reviewer_name"`
}

// TrackRequestResponse DTO untuk pelacakan nomor pengajuan publik.
type TrackRequestResponse struct {
	ID              string     `json:"id"`
	RequestNumber   string     `json:"request_number"`
	Status          string     `json:"status"`
	ServiceName     string     `json:"service_name"`
	ItemName        string     `json:"item_name"`
	SubmittedAt     *time.Time `json:"submitted_at"`
	CompletedAt     *time.Time `json:"completed_at"`
	RejectedAt      *time.Time `json:"rejected_at"`
	RevisionNote    *string    `json:"revision_note"`
	RejectionReason *string    `json:"rejection_reason"`
	CreatedAt       time.Time  `json:"created_at"`
}

type CategoryStats struct {
	ServiceCount  int `json:"serviceCount"`
	UserCount     int `json:"userCount"`
	TotalRequests int `json:"totalRequests"`
	NeedAction    int `json:"needAction"`
	Stats         struct {
		Submitted   int `json:"submitted"`
		UnderReview int `json:"underReview"`
		Revision    int `json:"revision"`
		Finished    int `json:"finished"`
	} `json:"stats"`
}

// DashboardStats merepresentasikan statistik lengkap terpisah (Masyarakat & Pegawai) untuk admin dashboard.
type DashboardStats struct {
	Masyarakat CategoryStats `json:"masyarakat"`
	Pegawai    CategoryStats `json:"pegawai"`
	Requests   struct {
		Total     int `json:"total"`
		Pending   int `json:"pending"`
		Approved  int `json:"approved"`
		Completed int `json:"completed"`
		Rejected  int `json:"rejected"`
	} `json:"requests"`
	Feedbacks struct {
		Total   int `json:"total"`
		Pending int `json:"pending"`
	} `json:"feedbacks"`
	Appointments struct {
		Total   int `json:"total"`
		Pending int `json:"pending"`
	} `json:"appointments"`
	GuestBook struct {
		Total int `json:"total"`
	} `json:"guest_book"`
}

// UserArchiveDocument merepresentasikan dokumen dalam arsip pemohon (hasil upload persyaratan atau dokumen keluaran PTSP).
type UserArchiveDocument struct {
	ID            string    `json:"id"`
	FileName      string    `json:"fileName"`
	FilePath      string    `json:"filePath"`
	FileType      string    `json:"fileType"`
	FileSize      string    `json:"fileSize"`
	CreatedAt     time.Time `json:"createdAt"`
	Source        string    `json:"source"` // "uploaded" | "generated"
	RequestNumber string    `json:"requestNumber"`
	ServiceName   string    `json:"serviceName"`
	RequestStatus string    `json:"requestStatus"`
}

