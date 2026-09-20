package models

// LoginRequest merepresentasikan payload login untuk seluruh role (petugas, pegawai, pemohon).
type LoginRequest struct {
	Identifier string `json:"identifier"` // Email, NIP, atau No WhatsApp
	Password   string `json:"password"`
	Mode       string `json:"mode"`        // "petugas" | "pegawai" | "pemohon"
	RememberMe bool   `json:"remember_me"`
}

// RegisterRequest merepresentasikan pendaftaran mandiri pemohon atau petugas baru.
type RegisterRequest struct {
	Nama      string `json:"nama"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Phone     string `json:"phone"`
	NIP       string `json:"nip,omitempty"`
	Role      string `json:"role,omitempty"`
	UnitKerja string `json:"unit_kerja,omitempty"`
	Jabatan   string `json:"jabatan,omitempty"`
	Alamat      string `json:"alamat,omitempty"`
	MetodeLogin string `json:"metode_login,omitempty"`
	Mode        string `json:"mode"` // "petugas" | "pemohon"
}

// ChangePasswordRequest payload ganti password.
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// ResetPasswordRequest payload reset password oleh admin.
type ResetPasswordRequest struct {
	UserID   string `json:"user_id"`
	UserType string `json:"user_type"` // "petugas" | "pegawai" | "pemohon"
	Password string `json:"password"`
}

// AuthUser model representasi data pengguna hasil autentikasi.
type AuthUser struct {
	ID          string   `json:"id"`
	UserID      string   `json:"user_id"`
	Nama        string   `json:"nama"`
	Email       string   `json:"email"`
	Phone       string   `json:"phone,omitempty"`
	NIP         string   `json:"nip,omitempty"`
	Role        string   `json:"role"`
	UserType    string   `json:"user_type"` // "internal_admin" | "internal_pegawai" | "eksternal_masyarakat"
	Jabatan     string   `json:"jabatan,omitempty"`
	UnitKerja   string   `json:"unit_kerja,omitempty"`
	Status      string   `json:"status"`
	IsVerified  bool     `json:"is_verified"`
	Permissions []string `json:"permissions"`
	AvatarURL   string   `json:"avatar_url,omitempty"`
}

// AuthResponse format balikan JSON untuk operasi autentikasi.
type AuthResponse struct {
	Success bool      `json:"success"`
	Message string    `json:"message,omitempty"`
	Error   string    `json:"error,omitempty"`
	Token   string    `json:"token,omitempty"`
	User    *AuthUser `json:"user,omitempty"`
}
