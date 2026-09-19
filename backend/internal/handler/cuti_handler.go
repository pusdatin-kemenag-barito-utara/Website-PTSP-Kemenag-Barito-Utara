package handler

import (
	"fmt"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"

	"github.com/gofiber/fiber/v3"
)

type CutiHandler struct {
	svc *service.CutiService
}

func NewCutiHandler(svc *service.CutiService) *CutiHandler {
	return &CutiHandler{svc: svc}
}

func (h *CutiHandler) GetPejabatNIPs(c fiber.Ctx) error {
	nips, err := h.svc.GetPejabatNIPs(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if nips == nil {
		nips = []string{}
	}
	return c.JSON(fiber.Map{"success": true, "data": nips})
}

func (h *CutiHandler) GetPejabatList(c fiber.Ctx) error {
	list, err := h.svc.GetPejabatList(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if list == nil {
		list = []models.PejabatItem{}
	}
	return c.JSON(fiber.Map{"success": true, "data": list})
}

func (h *CutiHandler) UpsertPejabat(c fiber.Ctx) error {
	var req models.UpsertPejabatRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if id := c.Params("id"); id != "" {
		req.ID = id
	}
	if err := h.svc.UpsertPejabat(c.Context(), req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Data pejabat berhasil disimpan"})
}

func (h *CutiHandler) DeletePejabat(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID pejabat diperlukan"})
	}
	if err := h.svc.DeletePejabat(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Data pejabat berhasil dihapus"})
}

func (h *CutiHandler) ReorderPejabat(c fiber.Ctx) error {
	var items []models.ReorderPejabatItem
	if err := c.Bind().Body(&items); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload urutan tidak valid"})
	}
	if err := h.svc.ReorderPejabat(c.Context(), items); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Urutan pejabat berhasil disimpan"})
}

func (h *CutiHandler) GetCuti(c fiber.Ctx) error {
	requestID := c.Query("request_id")
	if requestID != "" {
		res, err := h.svc.GetByRequestID(c.Context(), requestID)
		if err != nil || res == nil {
			return c.JSON(fiber.Map{"success": true, "data": nil})
		}
		return c.JSON(fiber.Map{"success": true, "data": res})
	}

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

func (h *CutiHandler) CreateCuti(c fiber.Ctx) error {
	var req models.CreateCutiRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	id, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "id": id})
}

func (h *CutiHandler) UpdateStatus(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateCutiStatusRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	if err := h.svc.UpdateStatus(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Status cuti berhasil diperbarui"})
}

// --- Laporan Kinerja Harian (LKH) ---

func (h *CutiHandler) GetLKH(c fiber.Ctx) error {
	userID := c.Query("userId")
	if userID == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "userId wajib diisi"})
	}
	monthStr := c.Query("month")
	yearStr := c.Query("year")
	var month, year int
	if monthStr != "" {
		fmt.Sscanf(monthStr, "%d", &month)
	}
	if yearStr != "" {
		fmt.Sscanf(yearStr, "%d", &year)
	}
	data, err := h.svc.GetLKH(c.Context(), userID, month, year)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.LaporanKinerja{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *CutiHandler) CreateLKH(c fiber.Ctx) error {
	var req models.CreateLaporanKinerjaRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if err := h.svc.CreateLKH(c.Context(), req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "message": "LKH berhasil disimpan"})
}

func (h *CutiHandler) BulkCreateLKH(c fiber.Ctx) error {
	var req models.BulkCreateLaporanKinerjaRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if err := h.svc.BulkCreateLKH(c.Context(), req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "message": "Bulk LKH berhasil disimpan"})
}

func (h *CutiHandler) DeleteLKH(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.DeleteLKH(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "LKH berhasil dihapus"})
}

func (h *CutiHandler) AdminGetLKH(c fiber.Ctx) error {
	search := c.Query("search")
	unitKerja := c.Query("unitKerja")
	status := c.Query("status")
	date := c.Query("date")
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	var month, year int
	if monthStr != "" {
		fmt.Sscanf(monthStr, "%d", &month)
	}
	if yearStr != "" {
		fmt.Sscanf(yearStr, "%d", &year)
	}

	data, err := h.svc.AdminGetLKH(c.Context(), search, unitKerja, status, date, month, year)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.AdminLaporanKinerjaItem{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *CutiHandler) AdminUpdateLKHStatus(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "ID LKH wajib diisi"})
	}
	var req models.UpdateLKHStatusRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if req.Status != "pending" && req.Status != "approved" && req.Status != "revision" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Status tidak valid"})
	}

	if err := h.svc.AdminUpdateLKHStatus(c.Context(), id, req.Status, req.KomentarPimpinan); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Status LKH berhasil diperbarui"})
}

// --- Admin: Master Pegawai & Rekap Cuti ---

func (h *CutiHandler) AdminListPegawai(c fiber.Ctx) error {
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

func (h *CutiHandler) AdminCreatePegawai(c fiber.Ctx) error {
	var req models.CreateCutiPegawaiRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	res, err := h.svc.AdminCreatePegawai(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": res, "message": "Pegawai berhasil ditambahkan"})
}

func (h *CutiHandler) AdminUpdatePegawai(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateCutiPegawaiRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	res, err := h.svc.AdminUpdatePegawai(c.Context(), id, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": res, "message": "Data pegawai berhasil diperbarui"})
}

func (h *CutiHandler) AdminDeletePegawai(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.AdminDeletePegawai(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Data pegawai berhasil dihapus"})
}

func (h *CutiHandler) AdminCreateRekap(c fiber.Ctx) error {
	var req models.CreateRekapCutiRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	res, err := h.svc.AdminCreateRekap(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": res, "message": "Rekap cuti berhasil ditambahkan"})
}

func (h *CutiHandler) AdminUpdateRekap(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateRekapCutiRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	res, err := h.svc.AdminUpdateRekap(c.Context(), id, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": res, "message": "Rekap cuti berhasil diperbarui"})
}

func (h *CutiHandler) AdminDeleteRekap(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.AdminDeleteRekap(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Rekap cuti berhasil dihapus"})
}

func (h *CutiHandler) AdminRolloverTahunan(c fiber.Ctx) error {
	var body struct {
		TahunTujuan int `json:"tahunTujuan"`
	}
	if err := c.Bind().Body(&body); err != nil || body.TahunTujuan == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Tahun tujuan wajib diisi"})
	}
	count, err := h.svc.AdminRolloverTahunan(c.Context(), body.TahunTujuan)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Tutup buku berhasil", "count": count})
}

func (h *CutiHandler) AdminSyncPusdatin(c fiber.Ctx) error {
	count, err := h.svc.AdminSyncPusdatin(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": fmt.Sprintf("Berhasil sinkronisasi %d data pegawai dari Pusdatin", count)})
}

