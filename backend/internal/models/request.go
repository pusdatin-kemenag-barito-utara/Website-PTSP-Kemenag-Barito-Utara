package models

import "time"

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
	ApplicantEmail *string `json:"applicant_email,omitempty"`
	RoleOwner      string  `json:"role_owner,omitempty"`
	Category       string  `json:"category,omitempty"`
}

// RequestAnswer merepresentasikan jawaban form pengajuan.
type RequestAnswer struct {
	FieldName  string `json:"field_name"`
	FieldValue string `json:"field_value"`
}

// RequestDocument merepresentasikan dokumen yang diunggah untuk pengajuan.
type RequestDocument struct {
	ID       string `json:"id"`
	FileName string `json:"file_name"`
	FilePath string `json:"file_path"`
	FileType string `json:"file_type"`
	FileSize int64  `json:"file_size"`
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

// ServiceRequestDetail adalah detail lengkap pengajuan (admin view).
type ServiceRequestDetail struct {
	ServiceRequest
	Answers      []RequestAnswer  `json:"answers"`
	Documents    []RequestDocument `json:"documents"`
	Reviews      []RequestReview  `json:"reviews"`
	ActivityLogs []ActivityLog    `json:"activity_logs"`
}

// UpdateRequestStatusRequest DTO untuk update status pengajuan.
type UpdateRequestStatusRequest struct {
	Status          string `json:"status"`
	RejectionReason string `json:"rejectionReason"`
	RevisionNote    string `json:"revisionNote"`
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

