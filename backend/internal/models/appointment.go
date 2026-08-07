package models

import "time"

// Appointment merepresentasikan satu janji temu.
type Appointment struct {
	ID              int64     `json:"id"`
	GuestName       string    `json:"guest_name"`
	Whatsapp        string    `json:"whatsapp"`
	InstitutionType string    `json:"institution_type"`
	InstitutionName *string   `json:"institution_name"`
	IntendedOfficer string    `json:"intended_officer"`
	Purpose         string    `json:"purpose"`
	AppointmentDate time.Time `json:"appointment_date"`
	AppointmentTime string    `json:"appointment_time"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
}

// CreateAppointmentRequest adalah DTO untuk membuat janji temu baru.
type CreateAppointmentRequest struct {
	GuestName       string `json:"guestName"`
	Whatsapp        string `json:"whatsapp"`
	InstitutionType string `json:"institutionType"`
	InstitutionName string `json:"institutionName"`
	IntendedOfficer string `json:"intendedOfficer"`
	Purpose         string `json:"purpose"`
	AppointmentDate string `json:"appointmentDate"`
	AppointmentTime string `json:"appointmentTime"`
	TurnstileToken  string `json:"turnstileToken"`
}

// UpdateAppointmentStatusRequest adalah DTO untuk update status janji temu.
type UpdateAppointmentStatusRequest struct {
	Status string `json:"status"`
}
