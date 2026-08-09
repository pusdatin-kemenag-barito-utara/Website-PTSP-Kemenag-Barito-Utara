package repository

import (
	"context"

	"ptsp-kemenag-backend/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ServiceRepository menangani operasi DB untuk Layanan PTSP, Service Items, Requirements, Form Fields, dan Master Options.
type ServiceRepository struct {
	db *pgxpool.Pool
}

func NewServiceRepository(db *pgxpool.Pool) *ServiceRepository {
	return &ServiceRepository{db: db}
}

func (r *ServiceRepository) FindAllWithItems(ctx context.Context) ([]models.Service, error) {
	rows, err := r.db.Query(ctx, `
		SELECT s.id, s.name, s.slug, s.description, s.category, s.role_owner, s.requirements_text, s.sop_url, s.sort_order, s.is_active,
		       si.id AS item_id, si.name AS item_name, si.slug AS item_slug, si.description AS item_desc, si.estimated_time,
		       CASE WHEN s.is_active = false THEN false ELSE COALESCE(si.is_active, true) END AS item_is_active
		FROM kemenag_ptsp.ptsp_services s
		LEFT JOIN kemenag_ptsp.ptsp_service_items si ON si.service_id = s.id
		ORDER BY s.sort_order ASC, si.sort_order ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	servicesMap := map[int64]*models.Service{}
	servicesOrder := []int64{}

	for rows.Next() {
		var sID int64
		var sName, sSlug, sCategory string
		var sDesc, sRoleOwner, sReqText, sSopURL *string
		var sSortOrder int
		var sIsActive bool
		var itemID *int64
		var itemName, itemSlug *string
		var itemDesc, itemEstTime *string
		var itemIsActive *bool

		if err := rows.Scan(&sID, &sName, &sSlug, &sDesc, &sCategory, &sRoleOwner, &sReqText, &sSopURL, &sSortOrder, &sIsActive,
			&itemID, &itemName, &itemSlug, &itemDesc, &itemEstTime, &itemIsActive); err != nil {
			continue
		}

		if _, exists := servicesMap[sID]; !exists {
			svc := &models.Service{
				ID:               sID,
				Name:             sName,
				Slug:             sSlug,
				Description:      sDesc,
				Category:         sCategory,
				RoleOwner:        sRoleOwner,
				RequirementsText: sReqText,
				SopURL:           sSopURL,
				SortOrder:        sSortOrder,
				IsActive:         sIsActive,
				Items:            []models.ServiceItem{},
			}
			servicesMap[sID] = svc
			servicesOrder = append(servicesOrder, sID)
		}

		if itemID != nil && itemName != nil {
			itemActiveState := true
			if itemIsActive != nil {
				itemActiveState = *itemIsActive
			}
			servicesMap[sID].Items = append(servicesMap[sID].Items, models.ServiceItem{
				ID:            *itemID,
				ServiceID:     sID,
				Name:          *itemName,
				Slug:          *itemSlug,
				Description:   itemDesc,
				IsActive:      itemActiveState,
				EstimatedTime: itemEstTime,
				Requirements:  []models.ServiceRequirement{},
				FormFields:    []models.ServiceFormField{},
			})
		}
	}

	// Populasikan Requirements dan FormFields secara terintegrasi untuk seluruh item
	reqRows, err := r.db.Query(ctx, `
		SELECT id, service_item_id, document_name, description, is_required, allowed_extensions, max_file_size_mb, sort_order
		FROM kemenag_ptsp.ptsp_service_requirements
		ORDER BY sort_order ASC
	`)
	if err == nil {
		reqsMap := map[int64][]models.ServiceRequirement{}
		for reqRows.Next() {
			var req models.ServiceRequirement
			if err := reqRows.Scan(&req.ID, &req.ServiceItemID, &req.DocumentName, &req.Description, &req.IsRequired, &req.AllowedExtensions, &req.MaxFileSizeMb, &req.SortOrder); err == nil {
				reqsMap[req.ServiceItemID] = append(reqsMap[req.ServiceItemID], req)
			}
		}
		reqRows.Close()

		for _, svc := range servicesMap {
			for i := range svc.Items {
				if reqs, ok := reqsMap[svc.Items[i].ID]; ok {
					svc.Items[i].Requirements = reqs
				}
			}
		}
	}

	ffRows, err := r.db.Query(ctx, `
		SELECT id, service_item_id, label, name, type, placeholder, is_required, options, sort_order
		FROM kemenag_ptsp.ptsp_service_form_fields
		ORDER BY sort_order ASC
	`)
	if err == nil {
		ffMap := map[int64][]models.ServiceFormField{}
		for ffRows.Next() {
			var ff models.ServiceFormField
			if err := ffRows.Scan(&ff.ID, &ff.ServiceItemID, &ff.Label, &ff.Name, &ff.Type, &ff.Placeholder, &ff.IsRequired, &ff.Options, &ff.SortOrder); err == nil {
				ffMap[ff.ServiceItemID] = append(ffMap[ff.ServiceItemID], ff)
			}
		}
		ffRows.Close()

		for _, svc := range servicesMap {
			for i := range svc.Items {
				if ffs, ok := ffMap[svc.Items[i].ID]; ok {
					svc.Items[i].FormFields = ffs
				}
			}
		}
	}

	result := make([]models.Service, 0, len(servicesOrder))
	for _, id := range servicesOrder {
		result = append(result, *servicesMap[id])
	}
	return result, nil
}

func (r *ServiceRepository) FindBySlug(ctx context.Context, slug string) (*models.Service, error) {
	var s models.Service
	err := r.db.QueryRow(ctx, `
		SELECT id, name, slug, description, category, role_owner, requirements_text, sop_url
		FROM kemenag_ptsp.ptsp_services WHERE slug = $1 AND is_active = true
	`, slug).Scan(&s.ID, &s.Name, &s.Slug, &s.Description, &s.Category, &s.RoleOwner, &s.RequirementsText, &s.SopURL)

	if err != nil {
		return nil, err
	}

	itemRows, _ := r.db.Query(ctx, `
		SELECT id, name, slug, description, estimated_time FROM kemenag_ptsp.ptsp_service_items
		WHERE service_id = $1 AND is_active = true ORDER BY sort_order ASC
	`, s.ID)
	defer itemRows.Close()

	for itemRows.Next() {
		var item models.ServiceItem
		item.ServiceID = s.ID
		if err := itemRows.Scan(&item.ID, &item.Name, &item.Slug, &item.Description, &item.EstimatedTime); err == nil {
			item.Requirements = []models.ServiceRequirement{}
			item.FormFields = []models.ServiceFormField{}
			s.Items = append(s.Items, item)
		}
	}
	itemRows.Close()

	if len(s.Items) > 0 {
		// Map item ID to index for O(1) lookup
		itemIndexMap := make(map[int64]int, len(s.Items))
		itemIDs := make([]int64, len(s.Items))
		for idx, it := range s.Items {
			itemIndexMap[it.ID] = idx
			itemIDs[idx] = it.ID
		}

		// Batch fetch all requirements for items in this service
		reqRows, errReq := r.db.Query(ctx, `
			SELECT id, service_item_id, document_name, description, is_required, allowed_extensions, max_file_size_mb, sort_order 
			FROM kemenag_ptsp.ptsp_service_requirements 
			WHERE service_item_id = ANY($1) 
			ORDER BY sort_order ASC
		`, itemIDs)
		if errReq == nil && reqRows != nil {
			for reqRows.Next() {
				var req models.ServiceRequirement
				if err := reqRows.Scan(&req.ID, &req.ServiceItemID, &req.DocumentName, &req.Description, &req.IsRequired, &req.AllowedExtensions, &req.MaxFileSizeMb, &req.SortOrder); err == nil {
					if idx, ok := itemIndexMap[req.ServiceItemID]; ok {
						s.Items[idx].Requirements = append(s.Items[idx].Requirements, req)
					}
				}
			}
			reqRows.Close()
		}

		// Batch fetch all form fields for items in this service
		ffRows, errFf := r.db.Query(ctx, `
			SELECT id, service_item_id, label, name, type, placeholder, is_required, options, sort_order 
			FROM kemenag_ptsp.ptsp_service_form_fields 
			WHERE service_item_id = ANY($1) 
			ORDER BY sort_order ASC
		`, itemIDs)
		if errFf == nil && ffRows != nil {
			for ffRows.Next() {
				var ff models.ServiceFormField
				if err := ffRows.Scan(&ff.ID, &ff.ServiceItemID, &ff.Label, &ff.Name, &ff.Type, &ff.Placeholder, &ff.IsRequired, &ff.Options, &ff.SortOrder); err == nil {
					if idx, ok := itemIndexMap[ff.ServiceItemID]; ok {
						s.Items[idx].FormFields = append(s.Items[idx].FormFields, ff)
					}
				}
			}
			ffRows.Close()
		}
	}

	return &s, nil
}

// Master Options & Requirements
func (r *ServiceRepository) FindMasterOptions(ctx context.Context) ([]models.MasterOption, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, category, value, label, sort_order, is_active 
		FROM kemenag_ptsp.ptsp_master_options ORDER BY category, sort_order ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.MasterOption
	for rows.Next() {
		var o models.MasterOption
		if err := rows.Scan(&o.ID, &o.Category, &o.Value, &o.Label, &o.SortOrder, &o.IsActive); err == nil {
			result = append(result, o)
		}
	}
	return result, nil
}

func (r *ServiceRepository) UpsertMasterOption(ctx context.Context, req models.UpsertMasterOptionRequest) (*models.MasterOption, error) {
	var o models.MasterOption
	if req.ID != "" {
		err := r.db.QueryRow(ctx, `
			UPDATE kemenag_ptsp.ptsp_master_options
			SET category=$1, value=$2, label=$3, sort_order=$4, is_active=$5, updated_at=NOW()
			WHERE id=$6::uuid
			RETURNING id::text, category, value, label, sort_order, is_active
		`, req.Category, req.Value, req.Label, req.SortOrder, req.IsActive, req.ID).
			Scan(&o.ID, &o.Category, &o.Value, &o.Label, &o.SortOrder, &o.IsActive)
		if err != nil {
			return nil, err
		}
	} else {
		err := r.db.QueryRow(ctx, `
			INSERT INTO kemenag_ptsp.ptsp_master_options (category, value, label, sort_order, is_active)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id::text, category, value, label, sort_order, is_active
		`, req.Category, req.Value, req.Label, req.SortOrder, req.IsActive).
			Scan(&o.ID, &o.Category, &o.Value, &o.Label, &o.SortOrder, &o.IsActive)
		if err != nil {
			return nil, err
		}
	}
	return &o, nil
}

func (r *ServiceRepository) DeleteMasterOption(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_master_options WHERE id=$1::uuid`, id)
	return err
}


func (r *ServiceRepository) FindRequirementsByServiceItemID(ctx context.Context, itemID string) ([]models.ServiceRequirement, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, service_item_id, document_name, description, is_required, allowed_extensions, max_file_size_mb, sort_order
		FROM kemenag_ptsp.ptsp_service_requirements WHERE service_item_id = $1 ORDER BY sort_order ASC
	`, itemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.ServiceRequirement
	for rows.Next() {
		var req models.ServiceRequirement
		if err := rows.Scan(&req.ID, &req.ServiceItemID, &req.DocumentName, &req.Description, &req.IsRequired, &req.AllowedExtensions, &req.MaxFileSizeMb, &req.SortOrder); err == nil {
			result = append(result, req)
		}
	}
	return result, nil
}

func (r *ServiceRepository) FindFormFieldsByServiceItemID(ctx context.Context, itemID string) ([]models.ServiceFormField, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, service_item_id, label, name, type, placeholder, is_required, options, sort_order
		FROM kemenag_ptsp.ptsp_service_form_fields WHERE service_item_id = $1 ORDER BY sort_order ASC
	`, itemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.ServiceFormField
	for rows.Next() {
		var ff models.ServiceFormField
		if err := rows.Scan(&ff.ID, &ff.ServiceItemID, &ff.Label, &ff.Name, &ff.Type, &ff.Placeholder, &ff.IsRequired, &ff.Options, &ff.SortOrder); err == nil {
			result = append(result, ff)
		}
	}
	return result, nil
}

// --- Admin: CRUD Services ---

func (r *ServiceRepository) CreateService(ctx context.Context, req models.CreateServiceRequest) (*models.Service, error) {
	var s models.Service
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_services
			(name, slug, description, category, role_owner, requirements_text, sop_url, request_code, is_active, sort_order)
		VALUES ($1, $2, NULLIF($3,''), $4, NULLIF($5,''), NULLIF($6,''), NULLIF($7,''), NULLIF($8,''), true, COALESCE(
			(SELECT COALESCE(MAX(sort_order),0)+1 FROM kemenag_ptsp.ptsp_services), 1
		))
		RETURNING id, name, slug, description, category, role_owner, requirements_text, sop_url, sort_order, is_active, request_code
	`, req.Name, req.Slug, req.Description, req.Category, req.RoleOwner, req.RequirementsText, req.SopURL, req.RequestCode).
		Scan(&s.ID, &s.Name, &s.Slug, &s.Description, &s.Category, &s.RoleOwner, &s.RequirementsText, &s.SopURL, &s.SortOrder, &s.IsActive, &s.RequestCode)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *ServiceRepository) UpdateService(ctx context.Context, id int64, req models.UpdateServiceRequest) (*models.Service, error) {
	roleOwnerVal := req.RoleOwner
	if roleOwnerVal == "" && req.RoleOwnerSnake != "" {
		roleOwnerVal = req.RoleOwnerSnake
	}
	isActiveVal := true
	if req.IsActive != nil {
		isActiveVal = *req.IsActive
	} else if req.IsActiveSnake != nil {
		isActiveVal = *req.IsActiveSnake
	}

	var s models.Service
	err := r.db.QueryRow(ctx, `
		UPDATE kemenag_ptsp.ptsp_services
		SET name=$1, description=NULLIF($2,''), category=$3, role_owner=NULLIF($4,''),
		    requirements_text=NULLIF($5,''), sop_url=NULLIF($6,''), request_code=NULLIF($7,''),
		    is_active=$8, updated_at=NOW()
		WHERE id=$9
		RETURNING id, name, slug, description, category, role_owner, requirements_text, sop_url, sort_order, is_active, request_code
	`, req.Name, req.Description, req.Category, roleOwnerVal, req.RequirementsText, req.SopURL, req.RequestCode, isActiveVal, id).
		Scan(&s.ID, &s.Name, &s.Slug, &s.Description, &s.Category, &s.RoleOwner, &s.RequirementsText, &s.SopURL, &s.SortOrder, &s.IsActive, &s.RequestCode)
	if err != nil {
		return nil, err
	}

	// Sinkronkan status is_active ke seluruh item layanan turunan di database
	_, _ = r.db.Exec(ctx, `UPDATE kemenag_ptsp.ptsp_service_items SET is_active = $1 WHERE service_id = $2`, isActiveVal, id)

	return &s, nil
}

func (r *ServiceRepository) DeleteService(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_services WHERE id=$1`, id)
	return err
}

func (r *ServiceRepository) ReorderServices(ctx context.Context, ids []int64) error {
	for i, id := range ids {
		_, err := r.db.Exec(ctx,
			`UPDATE kemenag_ptsp.ptsp_services SET sort_order=$1, updated_at=NOW() WHERE id=$2`,
			i+1, id,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

// --- Admin: CRUD Service Items ---

func (r *ServiceRepository) CreateServiceItem(ctx context.Context, serviceID int64, req models.CreateServiceItemRequest) (*models.ServiceItem, error) {
	var item models.ServiceItem
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_items
			(service_id, name, slug, description, estimated_time, is_active, sort_order)
		VALUES ($1, $2, $3, NULLIF($4,''), NULLIF($5,''), true, COALESCE(
			(SELECT COALESCE(MAX(sort_order),0)+1 FROM kemenag_ptsp.ptsp_service_items WHERE service_id=$1), 1
		))
		RETURNING id, service_id, name, slug, description, is_active, sort_order, estimated_time
	`, serviceID, req.Name, req.Slug, req.Description, req.EstimatedTime).
		Scan(&item.ID, &item.ServiceID, &item.Name, &item.Slug, &item.Description, &item.IsActive, &item.SortOrder, &item.EstimatedTime)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ServiceRepository) UpdateServiceItem(ctx context.Context, id int64, req models.UpdateServiceItemRequest) (*models.ServiceItem, error) {
	var item models.ServiceItem
	err := r.db.QueryRow(ctx, `
		UPDATE kemenag_ptsp.ptsp_service_items
		SET name=$1, description=NULLIF($2,''), estimated_time=NULLIF($3,''), is_active=$4, updated_at=NOW()
		WHERE id=$5
		RETURNING id, service_id, name, slug, description, is_active, sort_order, estimated_time
	`, req.Name, req.Description, req.EstimatedTime, req.IsActive, id).
		Scan(&item.ID, &item.ServiceID, &item.Name, &item.Slug, &item.Description, &item.IsActive, &item.SortOrder, &item.EstimatedTime)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ServiceRepository) DeleteServiceItem(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_items WHERE id=$1`, id)
	return err
}

func (r *ServiceRepository) ReorderServiceItems(ctx context.Context, ids []int64) error {
	for i, id := range ids {
		_, err := r.db.Exec(ctx,
			`UPDATE kemenag_ptsp.ptsp_service_items SET sort_order=$1, updated_at=NOW() WHERE id=$2`,
			i+1, id,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

// --- Admin: CRUD Requirements ---

func (r *ServiceRepository) CreateRequirement(ctx context.Context, serviceItemID int64, req models.CreateRequirementRequest) (*models.ServiceRequirement, error) {
	isRequiredVal := true
	if req.IsRequired != nil {
		isRequiredVal = *req.IsRequired
	} else if req.IsRequiredSnake != nil {
		isRequiredVal = *req.IsRequiredSnake
	}

	var rq models.ServiceRequirement
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_requirements
			(service_item_id, document_name, description, is_required, allowed_extensions, max_file_size_mb, sort_order)
		VALUES ($1, $2, NULLIF($3,''), $4, $5, $6, COALESCE(
			(SELECT COALESCE(MAX(sort_order),0)+1 FROM kemenag_ptsp.ptsp_service_requirements WHERE service_item_id=$1), 1
		))
		RETURNING id, service_item_id, document_name, description, is_required, allowed_extensions, max_file_size_mb, sort_order
	`, serviceItemID, req.DocumentName, req.Description, isRequiredVal, req.AllowedExtensions, req.MaxFileSizeMb).
		Scan(&rq.ID, &rq.ServiceItemID, &rq.DocumentName, &rq.Description, &rq.IsRequired, &rq.AllowedExtensions, &rq.MaxFileSizeMb, &rq.SortOrder)
	if err != nil {
		return nil, err
	}
	return &rq, nil
}

func (r *ServiceRepository) UpdateRequirement(ctx context.Context, id int64, req models.UpdateRequirementRequest) (*models.ServiceRequirement, error) {
	isRequiredVal := true
	if req.IsRequired != nil {
		isRequiredVal = *req.IsRequired
	} else if req.IsRequiredSnake != nil {
		isRequiredVal = *req.IsRequiredSnake
	}

	var rq models.ServiceRequirement
	err := r.db.QueryRow(ctx, `
		UPDATE kemenag_ptsp.ptsp_service_requirements
		SET document_name=$1, description=NULLIF($2,''), is_required=$3, allowed_extensions=$4, max_file_size_mb=$5, updated_at=NOW()
		WHERE id=$6
		RETURNING id, service_item_id, document_name, description, is_required, allowed_extensions, max_file_size_mb, sort_order
	`, req.DocumentName, req.Description, isRequiredVal, req.AllowedExtensions, req.MaxFileSizeMb, id).
		Scan(&rq.ID, &rq.ServiceItemID, &rq.DocumentName, &rq.Description, &rq.IsRequired, &rq.AllowedExtensions, &rq.MaxFileSizeMb, &rq.SortOrder)
	if err != nil {
		return nil, err
	}
	return &rq, nil
}

func (r *ServiceRepository) DeleteRequirement(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_requirements WHERE id=$1`, id)
	return err
}

func (r *ServiceRepository) ReorderRequirements(ctx context.Context, ids []int64) error {
	for i, id := range ids {
		_, err := r.db.Exec(ctx,
			`UPDATE kemenag_ptsp.ptsp_service_requirements SET sort_order=$1, updated_at=NOW() WHERE id=$2`,
			i+1, id,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

// --- Admin: CRUD Form Fields ---

func (r *ServiceRepository) CreateFormField(ctx context.Context, serviceItemID int64, req models.CreateFormFieldRequest) (*models.ServiceFormField, error) {
	isRequiredVal := true
	if req.IsRequired != nil {
		isRequiredVal = *req.IsRequired
	} else if req.IsRequiredSnake != nil {
		isRequiredVal = *req.IsRequiredSnake
	}

	var ff models.ServiceFormField
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_service_form_fields
			(service_item_id, label, name, type, placeholder, is_required, options, sort_order)
		VALUES ($1, $2, $3, $4, NULLIF($5,''), $6, NULLIF($7,''), COALESCE(
			(SELECT COALESCE(MAX(sort_order),0)+1 FROM kemenag_ptsp.ptsp_service_form_fields WHERE service_item_id=$1), 1
		))
		RETURNING id, service_item_id, label, name, type, placeholder, is_required, options, sort_order
	`, serviceItemID, req.Label, req.Name, req.Type, req.Placeholder, isRequiredVal, req.Options).
		Scan(&ff.ID, &ff.ServiceItemID, &ff.Label, &ff.Name, &ff.Type, &ff.Placeholder, &ff.IsRequired, &ff.Options, &ff.SortOrder)
	if err != nil {
		return nil, err
	}
	return &ff, nil
}

func (r *ServiceRepository) UpdateFormField(ctx context.Context, id int64, req models.UpdateFormFieldRequest) (*models.ServiceFormField, error) {
	isRequiredVal := true
	if req.IsRequired != nil {
		isRequiredVal = *req.IsRequired
	} else if req.IsRequiredSnake != nil {
		isRequiredVal = *req.IsRequiredSnake
	}

	var ff models.ServiceFormField
	err := r.db.QueryRow(ctx, `
		UPDATE kemenag_ptsp.ptsp_service_form_fields
		SET label=$1, name=$2, type=$3, placeholder=NULLIF($4,''), is_required=$5, options=NULLIF($6,''), updated_at=NOW()
		WHERE id=$7
		RETURNING id, service_item_id, label, name, type, placeholder, is_required, options, sort_order
	`, req.Label, req.Name, req.Type, req.Placeholder, isRequiredVal, req.Options, id).
		Scan(&ff.ID, &ff.ServiceItemID, &ff.Label, &ff.Name, &ff.Type, &ff.Placeholder, &ff.IsRequired, &ff.Options, &ff.SortOrder)
	if err != nil {
		return nil, err
	}
	return &ff, nil
}

func (r *ServiceRepository) DeleteFormField(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_service_form_fields WHERE id=$1`, id)
	return err
}

func (r *ServiceRepository) ReorderFormFields(ctx context.Context, ids []int64) error {
	for i, id := range ids {
		_, err := r.db.Exec(ctx,
			`UPDATE kemenag_ptsp.ptsp_service_form_fields SET sort_order=$1, updated_at=NOW() WHERE id=$2`,
			i+1, id,
		)
		if err != nil {
			return err
		}
	}
	return nil
}
