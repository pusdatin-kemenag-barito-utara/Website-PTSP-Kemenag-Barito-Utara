package handler

import (
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"

	"github.com/gofiber/fiber/v2"
)

type ServiceHandler struct {
	svc     *service.ServiceService
	fileSvc *service.FileService
}

func NewServiceHandler(svc *service.ServiceService, fileSvc *service.FileService) *ServiceHandler {
	return &ServiceHandler{svc: svc, fileSvc: fileSvc}
}

func (h *ServiceHandler) GetServices(c *fiber.Ctx) error {
	data, err := h.svc.GetServicesWithItems(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.Service{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *ServiceHandler) GetServiceBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	data, err := h.svc.GetServiceBySlug(c.Context(), slug)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "error": "Layanan tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *ServiceHandler) GetMasterOptions(c *fiber.Ctx) error {
	data, err := h.svc.GetMasterOptions(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.MasterOption{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *ServiceHandler) AdminUpsertMasterOption(c *fiber.Ctx) error {
	var req models.UpsertMasterOptionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.Category == "" || req.Value == "" || req.Label == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Category, value, dan label wajib diisi"})
	}

	opt, err := h.svc.UpsertMasterOption(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": opt, "message": "Master option berhasil disimpan"})
}

func (h *ServiceHandler) AdminDeleteMasterOption(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID wajib diisi"})
	}
	if err := h.svc.DeleteMasterOption(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Master option berhasil dihapus"})
}


func (h *ServiceHandler) GetRequirements(c *fiber.Ctx) error {
	itemID := c.Params("serviceItemId")
	data, err := h.svc.GetRequirements(c.Context(), itemID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.ServiceRequirement{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *ServiceHandler) GetFormFields(c *fiber.Ctx) error {
	itemID := c.Params("serviceItemId")
	data, err := h.svc.GetFormFields(c.Context(), itemID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.ServiceFormField{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// --- Admin: CRUD Services ---

func (h *ServiceHandler) AdminCreateService(c *fiber.Ctx) error {
	var req models.CreateServiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.Name == "" || req.Slug == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Name dan slug wajib diisi"})
	}

	// Cek jika ada file banner multipart yang diunggah
	if fileHeader, err := c.FormFile("banner"); err == nil && fileHeader != nil && h.fileSvc != nil {
		bannerURL, uploadErr := h.fileSvc.UploadBanner(c.Context(), fileHeader, req.Slug)
		if uploadErr == nil && bannerURL != "" {
			req.SopURL = bannerURL // simpan URL banner R2
		}
	}

	svc, err := h.svc.CreateService(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": svc})
}

func (h *ServiceHandler) AdminUpdateService(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID tidak valid"})
	}

	var req models.UpdateServiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Name wajib diisi"})
	}

	// Cek jika ada file banner multipart yang diunggah
	if fileHeader, err := c.FormFile("banner"); err == nil && fileHeader != nil && h.fileSvc != nil {
		slug := req.Name
		if fileURL, uploadErr := h.fileSvc.UploadBanner(c.Context(), fileHeader, slug); uploadErr == nil && fileURL != "" {
			// Banner R2 berhasil diunggah
		}
	}

	svc, err := h.svc.UpdateService(c.Context(), int64(id), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": svc})
}

func (h *ServiceHandler) AdminDeleteService(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID tidak valid"})
	}
	if err := h.svc.DeleteService(c.Context(), int64(id)); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Layanan berhasil dihapus"})
}

func (h *ServiceHandler) AdminReorderServices(c *fiber.Ctx) error {
	var req models.ReorderServicesRequest
	if err := c.BodyParser(&req); err != nil || len(req.IDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid atau IDs kosong"})
	}
	if err := h.svc.ReorderServices(c.Context(), req.IDs); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Urutan layanan berhasil disimpan"})
}

// --- Admin: CRUD Requirements ---

func (h *ServiceHandler) AdminCreateRequirement(c *fiber.Ctx) error {
	serviceItemID, err := c.ParamsInt("serviceItemId")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID service item tidak valid"})
	}

	var req models.CreateRequirementRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.DocumentName == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Nama dokumen wajib diisi"})
	}
	if req.AllowedExtensions == "" {
		req.AllowedExtensions = "pdf,jpg,jpeg,png"
	}
	if req.MaxFileSizeMb == 0 {
		req.MaxFileSizeMb = 5
	}

	rq, err := h.svc.CreateRequirement(c.Context(), int64(serviceItemID), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": rq})
}

func (h *ServiceHandler) AdminUpdateRequirement(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID tidak valid"})
	}

	var req models.UpdateRequirementRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.DocumentName == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Nama dokumen wajib diisi"})
	}

	rq, err := h.svc.UpdateRequirement(c.Context(), int64(id), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": rq})
}

func (h *ServiceHandler) AdminDeleteRequirement(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID tidak valid"})
	}
	if err := h.svc.DeleteRequirement(c.Context(), int64(id)); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Persyaratan berhasil dihapus"})
}

func (h *ServiceHandler) AdminReorderRequirements(c *fiber.Ctx) error {
	var req models.ReorderRequirementsRequest
	if err := c.BodyParser(&req); err != nil || len(req.IDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid atau IDs kosong"})
	}
	if err := h.svc.ReorderRequirements(c.Context(), req.IDs); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Urutan persyaratan berhasil disimpan"})
}

// --- Admin: CRUD Service Items ---


func (h *ServiceHandler) AdminCreateServiceItem(c *fiber.Ctx) error {
	serviceID, err := c.ParamsInt("serviceId")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID layanan tidak valid"})
	}

	var req models.CreateServiceItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.Name == "" || req.Slug == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Name dan slug wajib diisi"})
	}

	item, err := h.svc.CreateServiceItem(c.Context(), int64(serviceID), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": item})
}

func (h *ServiceHandler) AdminUpdateServiceItem(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID tidak valid"})
	}

	var req models.UpdateServiceItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Name wajib diisi"})
	}

	item, err := h.svc.UpdateServiceItem(c.Context(), int64(id), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": item})
}

func (h *ServiceHandler) AdminDeleteServiceItem(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID tidak valid"})
	}
	if err := h.svc.DeleteServiceItem(c.Context(), int64(id)); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Item layanan berhasil dihapus"})
}

func (h *ServiceHandler) AdminReorderServiceItems(c *fiber.Ctx) error {
	var req models.ReorderServiceItemsRequest
	if err := c.BodyParser(&req); err != nil || len(req.IDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid atau IDs kosong"})
	}
	if err := h.svc.ReorderServiceItems(c.Context(), req.IDs); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Urutan item layanan berhasil disimpan"})
}

// --- Admin: CRUD Form Fields ---

func (h *ServiceHandler) AdminCreateFormField(c *fiber.Ctx) error {
	serviceItemID, err := c.ParamsInt("serviceItemId")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID service item tidak valid"})
	}

	var req models.CreateFormFieldRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.Label == "" || req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Label dan name wajib diisi"})
	}

	ff, err := h.svc.CreateFormField(c.Context(), int64(serviceItemID), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": ff})
}

func (h *ServiceHandler) AdminUpdateFormField(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID tidak valid"})
	}

	var req models.UpdateFormFieldRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if req.Label == "" || req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Label dan name wajib diisi"})
	}

	ff, err := h.svc.UpdateFormField(c.Context(), int64(id), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": ff})
}

func (h *ServiceHandler) AdminDeleteFormField(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID tidak valid"})
	}
	if err := h.svc.DeleteFormField(c.Context(), int64(id)); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Field berhasil dihapus"})
}

func (h *ServiceHandler) AdminReorderFormFields(c *fiber.Ctx) error {
	var req models.ReorderFormFieldsRequest
	if err := c.BodyParser(&req); err != nil || len(req.IDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid atau IDs kosong"})
	}
	if err := h.svc.ReorderFormFields(c.Context(), req.IDs); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Urutan field berhasil disimpan"})
}
