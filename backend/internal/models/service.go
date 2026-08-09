package models

import "time"

// Service merepresentasikan layanan PTSP.
type Service struct {
	ID               int64         `json:"id"`
	Name             string        `json:"name"`
	Slug             string        `json:"slug"`
	Description      *string       `json:"description"`
	Category         string        `json:"category"`
	RoleOwner        *string       `json:"role_owner"`
	RequirementsText *string       `json:"requirements_text"`
	SopURL           *string       `json:"sop_url"`
	SortOrder        int           `json:"sort_order"`
	IsActive         bool          `json:"is_active"`
	RequestCode      *string       `json:"request_code"`
	Items            []ServiceItem `json:"items,omitempty"`
}

// ServiceItem merepresentasikan sub-layanan dari sebuah layanan.
type ServiceItem struct {
	ID            int64                `json:"id"`
	ServiceID     int64                `json:"service_id"`
	Name          string               `json:"name"`
	Slug          string               `json:"slug"`
	Description   *string              `json:"description"`
	IsActive      bool                 `json:"is_active"`
	SortOrder     int                  `json:"sort_order"`
	EstimatedTime *string              `json:"estimated_time"`
	Requirements  []ServiceRequirement `json:"requirements,omitempty"`
	FormFields    []ServiceFormField   `json:"form_fields,omitempty"`
}

// ServiceRequirement merepresentasikan persyaratan dokumen untuk service item.
type ServiceRequirement struct {
	ID                int64   `json:"id"`
	ServiceItemID     int64   `json:"service_item_id"`
	DocumentName      string  `json:"document_name"`
	Description       *string `json:"description"`
	IsRequired        bool    `json:"is_required"`
	AllowedExtensions *string `json:"allowed_extensions"`
	MaxFileSizeMb     int     `json:"max_file_size_mb"`
	SortOrder         int     `json:"sort_order"`
}

// ServiceFormField merepresentasikan field form dinamis untuk service item.
type ServiceFormField struct {
	ID            int64   `json:"id"`
	ServiceItemID int64   `json:"service_item_id"`
	Label         string  `json:"label"`
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	Placeholder   *string `json:"placeholder"`
	IsRequired    bool    `json:"is_required"`
	Options       *string `json:"options"`
	SortOrder     int     `json:"sort_order"`
}

// CreateServiceRequest DTO untuk admin membuat layanan baru.
type CreateServiceRequest struct {
	Name             string `json:"name"`
	Slug             string `json:"slug"`
	Description      string `json:"description"`
	Category         string `json:"category"`
	RoleOwner        string `json:"roleOwner"`
	RequirementsText string `json:"requirementsText"`
	SopURL           string `json:"sopUrl"`
	SortOrder        int    `json:"sortOrder"`
	RequestCode      string `json:"requestCode"`
}

// UpdateServiceRequest DTO untuk admin update layanan.
type UpdateServiceRequest struct {
	Name             string `json:"name"`
	Description      string `json:"description"`
	Category         string `json:"category"`
	RoleOwner        string `json:"roleOwner"`
	RoleOwnerSnake   string `json:"role_owner"`
	RequirementsText string `json:"requirementsText"`
	SopURL           string `json:"sopUrl"`
	SortOrder        int    `json:"sortOrder"`
	IsActive         *bool  `json:"isActive"`
	IsActiveSnake    *bool  `json:"is_active"`
	RequestCode      string `json:"requestCode"`
}

// ReorderServicesRequest DTO untuk reorder services.
type ReorderServicesRequest struct {
	IDs []int64 `json:"ids"`
}

// CreateServiceItemRequest DTO untuk membuat service item.
type CreateServiceItemRequest struct {
	Name          string `json:"name"`
	Slug          string `json:"slug"`
	Description   string `json:"description"`
	SortOrder     int    `json:"sortOrder"`
	EstimatedTime string `json:"estimatedTime"`
}

// UpdateServiceItemRequest DTO untuk update service item.
type UpdateServiceItemRequest struct {
	Name          string `json:"name"`
	Description   string `json:"description"`
	SortOrder     int    `json:"sortOrder"`
	IsActive      bool   `json:"isActive"`
	EstimatedTime string `json:"estimatedTime"`
}

// ReorderServiceItemsRequest DTO untuk reorder service items.
type ReorderServiceItemsRequest struct {
	IDs []int64 `json:"ids"`
}

// CreateRequirementRequest DTO untuk membuat persyaratan.
type CreateRequirementRequest struct {
	DocumentName      string `json:"documentName"`
	Description       string `json:"description"`
	IsRequired        *bool  `json:"isRequired"`
	IsRequiredSnake   *bool  `json:"is_required"`
	AllowedExtensions string `json:"allowedExtensions"`
	MaxFileSizeMb     int    `json:"maxFileSizeMb"`
	SortOrder         int    `json:"sortOrder"`
}

// UpdateRequirementRequest DTO untuk update persyaratan.
type UpdateRequirementRequest struct {
	DocumentName      string `json:"documentName"`
	Description       string `json:"description"`
	IsRequired        *bool  `json:"isRequired"`
	IsRequiredSnake   *bool  `json:"is_required"`
	AllowedExtensions string `json:"allowedExtensions"`
	MaxFileSizeMb     int    `json:"maxFileSizeMb"`
}

// ReorderRequirementsRequest DTO untuk reorder requirements.
type ReorderRequirementsRequest struct {
	IDs []int64 `json:"ids"`
}

// CreateFormFieldRequest DTO untuk membuat form field.
type CreateFormFieldRequest struct {
	Label           string `json:"label"`
	Name            string `json:"name"`
	Type            string `json:"type"`
	Placeholder     string `json:"placeholder"`
	IsRequired      *bool  `json:"isRequired"`
	IsRequiredSnake *bool  `json:"is_required"`
	Options         string `json:"options"`
	SortOrder       int    `json:"sortOrder"`
}

// UpdateFormFieldRequest DTO untuk update form field.
type UpdateFormFieldRequest struct {
	Label           string `json:"label"`
	Name            string `json:"name"`
	Type            string `json:"type"`
	Placeholder     string `json:"placeholder"`
	IsRequired      *bool  `json:"isRequired"`
	IsRequiredSnake *bool  `json:"is_required"`
	Options         string `json:"options"`
}

// ReorderFormFieldsRequest DTO untuk reorder form fields.
type ReorderFormFieldsRequest struct {
	IDs []int64 `json:"ids"`
}

// MasterOption merepresentasikan opsi master (dropdown values).
type MasterOption struct {
	ID        string `json:"id"`
	Category  string `json:"category"`
	Value     string `json:"value"`
	Label     string `json:"label"`
	SortOrder int    `json:"sort_order"`
	IsActive  bool   `json:"is_active"`
}

// UpsertMasterOptionRequest DTO untuk admin upsert master option.
type UpsertMasterOptionRequest struct {
	ID        string `json:"id,omitempty"`
	Category  string `json:"category"`
	Value     string `json:"value"`
	Label     string `json:"label"`
	SortOrder int    `json:"sortOrder"`
	IsActive  bool   `json:"isActive"`
}

// ServiceWithCreatedAt digunakan saat membuat layanan baru (dengan timestamp).
type ServiceWithTimestamp struct {
	Service
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
