package models

import "time"

// User / Profile merepresentasikan akun pengguna sistem PTSP.
type User struct {
	ID              string      `json:"id"`
	Name            *string     `json:"name"`
	Email           *string     `json:"email"`
	Phone           *string     `json:"phone"`
	Role            string      `json:"role"`
	UserType        string      `json:"user_type"`
	Status          *string     `json:"status"`
	IsVerified      bool        `json:"is_verified"`
	AvatarURL       *string     `json:"avatar_url"`
	Permissions     interface{} `json:"permissions,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	
	// Tambahan untuk Pegawai & Petugas dari skema kemenag_ptsp
	Nip             *string     `json:"nip,omitempty"`
	Jabatan         *string     `json:"jabatan,omitempty"`
	PangkatGolongan *string     `json:"pangkat_golongan,omitempty"`
	UnitKerja       *string     `json:"unit_kerja,omitempty"`
	
	// Tambahan untuk Pemohon dari skema kemenag_ptsp
	Address         *string     `json:"address,omitempty"`
}

// UpdateUserRequest DTO untuk admin update user (role/status/verifikasi).
type UpdateUserRequest struct {
	Role        string `json:"role"`
	Status      string `json:"status"`
	IsVerified  bool   `json:"isVerified"`
	Permissions *any   `json:"permissions"`
}

// UpdateProfileRequest DTO untuk self-update profil (nama, phone, address, avatar).
type UpdateProfileRequest struct {
	Name        string `json:"name"`
	FullName    string `json:"full_name"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Address     string `json:"address"`
	AvatarURL   string `json:"avatar_url"`
	Base64Image string `json:"base64_image"`
	UserType    string `json:"user_type"`
	Password    string `json:"password,omitempty"`
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

// PetugasUser merepresentasikan akun petugas/admin dari kemenag_ptsp.profiles_petugas.
type PetugasUser struct {
	ID          string      `json:"id"`
	UserID      string      `json:"user_id"`
	Nama        string      `json:"nama"`
	Email       string      `json:"email"`
	NoHp        string      `json:"no_hp"`
	Nip         string      `json:"nip"`
	Jabatan     string      `json:"jabatan"`
	UnitKerja   string      `json:"unit_kerja"`
	Role        string      `json:"role"`
	Status      string      `json:"status"`
	IsVerified  bool        `json:"is_verified"`
	AvatarURL   string      `json:"avatar_url"`
	Permissions interface{} `json:"permissions"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// PegawaiUser merepresentasikan data pegawai Kemenag dari kemenag_ptsp.profiles_pegawai.
type PegawaiUser struct {
	ID              string    `json:"id"`
	UserID          *string   `json:"user_id,omitempty"`
	Nama            string    `json:"nama"`
	Nip             string    `json:"nip"`
	Jabatan         string    `json:"jabatan"`
	PangkatGolongan string    `json:"pangkat_golongan"`
	UnitKerja       string    `json:"unit_kerja"`
	NoHp            string    `json:"no_hp"`
	Email           string    `json:"email"`
	Status          string    `json:"status"`
	Role            string    `json:"role"`
	TipePejabat     string    `json:"tipe_pejabat"`
	OrderIndex      int       `json:"order_index"`
	AvatarURL       string    `json:"avatar_url"`
	IsVerified      bool      `json:"is_verified"`
	IsInCuti        bool      `json:"is_in_cuti"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// PemohonUser merepresentasikan akun pemohon masyarakat dari kemenag_ptsp.profiles_pemohon.
type PemohonUser struct {
	ID          string    `json:"id"`
	UserID      *string   `json:"user_id,omitempty"`
	Nama        string    `json:"nama"`
	Email       string    `json:"email"`
	NoHp        string    `json:"no_hp"`
	Alamat      string    `json:"alamat"`
	MetodeLogin string    `json:"metode_login"`
	Status      string    `json:"status"`
	Role        string    `json:"role"`
	AvatarURL   string    `json:"avatar_url"`
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreatePegawaiRequest DTO untuk input data pegawai baru.
type CreatePegawaiRequest struct {
	Nama            string `json:"nama"`
	Nip             string `json:"nip"`
	Jabatan         string `json:"jabatan"`
	PangkatGolongan string `json:"pangkat_golongan"`
	UnitKerja       string `json:"unit_kerja"`
	NoHp            string `json:"no_hp"`
	Email           string `json:"email"`
	Status          string `json:"status"`
	TipePejabat     string `json:"tipe_pejabat"`
}

// UpdatePegawaiRequest DTO untuk ubah data pegawai.
type UpdatePegawaiRequest struct {
	Nama            string `json:"nama"`
	Nip             string `json:"nip"`
	Jabatan         string `json:"jabatan"`
	PangkatGolongan string `json:"pangkat_golongan"`
	UnitKerja       string `json:"unit_kerja"`
	NoHp            string `json:"no_hp"`
	Email           string `json:"email"`
	Status          string `json:"status"`
	TipePejabat     string `json:"tipe_pejabat"`
}

// CreatePetugasRequest DTO untuk penambahan akun petugas baru oleh admin.
type CreatePetugasRequest struct {
	Nama        string `json:"nama"`
	Email       string `json:"email"`
	NoHp        string `json:"no_hp"`
	Nip         string `json:"nip"`
	Jabatan     string `json:"jabatan"`
	UnitKerja   string `json:"unit_kerja"`
	Role        string `json:"role"`
	Status      string `json:"status"`
	Password    string `json:"password"`
	IsVerified  bool   `json:"is_verified"`
	Permissions *any   `json:"permissions,omitempty"`
}

// UpdatePetugasRequest DTO untuk update data/role/permissions petugas.
type UpdatePetugasRequest struct {
	Nama        string `json:"nama,omitempty"`
	Role        string `json:"role,omitempty"`
	Status      string `json:"status,omitempty"`
	IsVerified  *bool  `json:"is_verified,omitempty"`
	Nip         string `json:"nip,omitempty"`
	Jabatan     string `json:"jabatan,omitempty"`
	UnitKerja   string `json:"unit_kerja,omitempty"`
	NoHp        string `json:"no_hp,omitempty"`
	Permissions *any   `json:"permissions,omitempty"`
}

// UpdatePemohonRequest DTO untuk update profil pemohon oleh admin.
type UpdatePemohonRequest struct {
	Nama   string `json:"nama,omitempty"`
	NoHp   string `json:"no_hp,omitempty"`
	Alamat string `json:"alamat,omitempty"`
	Status string `json:"status,omitempty"`
}

// UserStats ringkasan statistik pengguna untuk dashboard.
type UserStats struct {
	TotalPetugas    int `json:"total_petugas"`
	PendingPetugas  int `json:"pending_petugas"`
	TotalPegawai    int `json:"total_pegawai"`
	TotalPemohon    int `json:"total_pemohon"`
	PemohonGoogle   int `json:"pemohon_google"`
	PemohonWhatsApp int `json:"pemohon_whatsapp"`
}

