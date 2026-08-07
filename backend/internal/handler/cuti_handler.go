package handler

import (
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"

	"github.com/gofiber/fiber/v2"
)

type CutiHandler struct {
	svc *service.CutiService
}

func NewCutiHandler(svc *service.CutiService) *CutiHandler {
	return &CutiHandler{svc: svc}
}

func (h *CutiHandler) GetCuti(c *fiber.Ctx) error {
	nip := c.Query("nip")
	if nip != "" {
		res, err := h.svc.GetByNip(c.Context(), nip)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"success": false, "error": "Data pegawai atau rekap cuti tidak ditemukan"})
		}
		return c.JSON(fiber.Map{"success": true, "data": res})
	}

	userID := c.Query("user_id")
	data, err := h.svc.GetAll(c.Context(), userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.DataCutiPegawai{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *CutiHandler) CreateCuti(c *fiber.Ctx) error {
	var req models.CreateCutiRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	id, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "id": id})
}

func (h *CutiHandler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateCutiStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	if err := h.svc.UpdateStatus(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Status cuti berhasil diperbarui"})
}

// --- Laporan Kinerja Harian (LKH) ---

func (h *CutiHandler) GetLKH(c *fiber.Ctx) error {
	userID := c.Query("userId")
	if userID == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "userId wajib diisi"})
	}
	data, err := h.svc.GetLKH(c.Context(), userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.LaporanKinerja{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *CutiHandler) CreateLKH(c *fiber.Ctx) error {
	var req models.CreateLaporanKinerjaRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if err := h.svc.CreateLKH(c.Context(), req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "message": "LKH berhasil disimpan"})
}

func (h *CutiHandler) BulkCreateLKH(c *fiber.Ctx) error {
	var req models.BulkCreateLaporanKinerjaRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if err := h.svc.BulkCreateLKH(c.Context(), req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "message": "Bulk LKH berhasil disimpan"})
}

func (h *CutiHandler) DeleteLKH(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.DeleteLKH(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "LKH berhasil dihapus"})
}


// --- Admin: Master Pegawai & Rekap Cuti ---

func (h *CutiHandler) AdminListPegawai(c *fiber.Ctx) error {
	search := c.Query("search")
	data, err := h.svc.AdminListPegawai(c.Context(), search)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.CutiPegawaiMaster{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *CutiHandler) AdminCreatePegawai(c *fiber.Ctx) error {
	var req models.CreateCutiPegawaiRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	res, err := h.svc.AdminCreatePegawai(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": res, "message": "Pegawai berhasil ditambahkan"})
}

func (h *CutiHandler) AdminUpdatePegawai(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateCutiPegawaiRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	res, err := h.svc.AdminUpdatePegawai(c.Context(), id, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": res, "message": "Data pegawai berhasil diperbarui"})
}

func (h *CutiHandler) AdminDeletePegawai(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.AdminDeletePegawai(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Data pegawai berhasil dihapus"})
}

func (h *CutiHandler) AdminCreateRekap(c *fiber.Ctx) error {
	var req models.CreateRekapCutiRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	res, err := h.svc.AdminCreateRekap(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": res, "message": "Rekap cuti berhasil ditambahkan"})
}

func (h *CutiHandler) AdminUpdateRekap(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateRekapCutiRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	res, err := h.svc.AdminUpdateRekap(c.Context(), id, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": res, "message": "Rekap cuti berhasil diperbarui"})
}

func (h *CutiHandler) AdminDeleteRekap(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.AdminDeleteRekap(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Rekap cuti berhasil dihapus"})
}

func (h *CutiHandler) AdminRolloverTahunan(c *fiber.Ctx) error {
	var body struct {
		TahunTujuan int `json:"tahunTujuan"`
	}
	if err := c.BodyParser(&body); err != nil || body.TahunTujuan == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Tahun tujuan wajib diisi"})
	}
	count, err := h.svc.AdminRolloverTahunan(c.Context(), body.TahunTujuan)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Tutup buku berhasil", "count": count})
}

