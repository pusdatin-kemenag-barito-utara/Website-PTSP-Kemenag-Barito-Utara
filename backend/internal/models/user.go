package models

import "time"

// User / Profile merepresentasikan akun pengguna sistem PTSP.
type User struct {
	ID         string     `json:"id"`
	Name       *string    `json:"name"`
	Email      *string    `json:"email"`
	Phone      *string    `json:"phone"`
	Role       string     `json:"role"`
	UserType   string     `json:"user_type"`
	Status     *string    `json:"status"`
	IsVerified bool       `json:"is_verified"`
	AvatarURL  *string    `json:"avatar_url"`
	CreatedAt  time.Time  `json:"created_at"`
}

// UpdateUserRequest DTO untuk admin update user (role/status/verifikasi).
type UpdateUserRequest struct {
	Role        string `json:"role"`
	Status      string `json:"status"`
	IsVerified  bool   `json:"isVerified"`
	Permissions *any   `json:"permissions"`
}

// UpdateProfileRequest DTO untuk self-update profil (nama, avatar).
type UpdateProfileRequest struct {
	FullName    string `json:"full_name"`
	AvatarURL   string `json:"avatar_url"`
	Base64Image string `json:"base64_image"`
}

// AuditLog merepresentasikan log aktivitas admin.
type AuditLog struct {
	ID         int64   `json:"id"`
	AdminID    string  `json:"admin_id"`
	Action     string  `json:"action"`
	EntityType string  `json:"entity_type"`
	EntityID   *string `json:"entity_id"`
	AdminName  *string `json:"admin_name"`
	CreatedAt  string  `json:"created_at"`
}

// SearchResult merepresentasikan hasil pencarian lintas entitas.
type SearchResult struct {
	Requests []SearchRequestItem  `json:"requests"`
	Profiles []SearchProfileItem  `json:"profiles"`
	Services []SearchServiceItem  `json:"services"`
}

// SearchRequestItem hasil pencarian untuk service request.
type SearchRequestItem struct {
	ID            string  `json:"id"`
	RequestNumber string  `json:"requestNumber"`
	Status        string  `json:"status"`
	ServiceName   *string `json:"serviceName"`
	ApplicantName *string `json:"applicantName"`
	CreatedAt     string  `json:"createdAt"`
}

// SearchProfileItem hasil pencarian untuk profil pengguna.
type SearchProfileItem struct {
	ID       string  `json:"id"`
	FullName *string `json:"fullName"`
	Email    *string `json:"email"`
	Role     string  `json:"role"`
	Phone    *string `json:"phone"`
}

// SearchServiceItem hasil pencarian untuk layanan.
type SearchServiceItem struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}
