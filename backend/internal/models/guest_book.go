package models

import "time"

// GuestBook merepresentasikan satu entri buku tamu digital.
type GuestBook struct {
	ID              int64      `json:"id"`
	GuestName       string     `json:"guestName"`
	Whatsapp        string     `json:"whatsapp"`
	InstitutionType string     `json:"institutionType"`
	InstitutionName *string    `json:"institutionName"`
	IntendedOfficer string     `json:"intendedOfficer"`
	Purpose         string     `json:"purpose"`
	VisitDate       time.Time  `json:"visitDate"`
	CreatedAt       time.Time  `json:"createdAt"`
}

// CreateGuestBookRequest adalah DTO untuk membuat buku tamu baru.
type CreateGuestBookRequest struct {
	GuestName       string `json:"guestName"`
	Whatsapp        string `json:"whatsapp"`
	InstitutionType string `json:"institutionType"`
	InstitutionName string `json:"institutionName"`
	IntendedOfficer string `json:"intendedOfficer"`
	Purpose         string `json:"purpose"`
	VisitDate       string `json:"visitDate"`
	TurnstileToken  string `json:"turnstileToken"`
}
