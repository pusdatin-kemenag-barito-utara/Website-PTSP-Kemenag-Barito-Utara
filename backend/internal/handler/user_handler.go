package handler

import (
	"strconv"

	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"

	"github.com/gofiber/fiber/v3"
)

type UserHandler struct {
	svc     *service.UserService
	fileSvc *service.FileService
}

func NewUserHandler(svc *service.UserService, fileSvc *service.FileService) *UserHandler {
	return &UserHandler{svc: svc, fileSvc: fileSvc}
}

func (h *UserHandler) GetUsers(c fiber.Ctx) error {
	role := c.Query("role")
	status := c.Query("status")
	limit := 100
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 {
		limit = l
	}

	data, err := h.svc.GetAll(c.Context(), role, status, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.User{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *UserHandler) GetUserByID(c fiber.Ctx) error {
	id := c.Params("id")
	user, err := h.svc.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User tidak ditemukan", "details": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": user})
}

func (h *UserHandler) UpdateUser(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateUserRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	if err := h.svc.Update(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "User berhasil diperbarui"})
}

func (h *UserHandler) UpdateProfile(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateProfileRequest
	if err := c.Bind().Body(&req); err != nil {
		// Bind error ignore if multipart
	}

	// Cek jika ada unggahan avatar multipart atau base64
	if fileHeader, err := c.FormFile("avatar"); err == nil && fileHeader != nil && h.fileSvc != nil {
		avatarURL, uploadErr := h.fileSvc.UploadAvatar(c.Context(), fileHeader, id)
		if uploadErr == nil && avatarURL != "" {
			req.AvatarURL = avatarURL
		}
	} else if req.Base64Image != "" && h.fileSvc != nil {
		avatarURL, uploadErr := h.fileSvc.UploadBase64Avatar(c.Context(), req.Base64Image, id)
		if uploadErr == nil && avatarURL != "" {
			req.AvatarURL = avatarURL
		}
	}

	if req.FullName == "" && req.Phone == "" && req.Address == "" && req.AvatarURL == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Tidak ada data yang diperbarui"})
	}
	if err := h.svc.UpdateProfile(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "avatar_url": req.AvatarURL, "message": "Profil berhasil diperbarui"})
}

func (h *UserHandler) DeleteUser(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "User berhasil dihapus"})
}

func (h *UserHandler) GetAuditLogs(c fiber.Ctx) error {
	limit := 100
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 {
		limit = l
	}
	data, err := h.svc.GetAuditLogs(c.Context(), limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.AuditLog{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *UserHandler) Search(c fiber.Ctx) error {
	q := c.Query("q")
	res, err := h.svc.Search(c.Context(), q)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": res})
}

// ==========================================
// 1. HANDLER PETUGAS ADMIN
// ==========================================

func (h *UserHandler) GetPetugas(c fiber.Ctx) error {
	search := c.Query("search")
	role := c.Query("role")
	status := c.Query("status")
	limit := 50
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 {
		limit = l
	}
	offset := 0
	if p, err := strconv.Atoi(c.Query("page")); err == nil && p > 1 {
		offset = (p - 1) * limit
	}

	data, total, err := h.svc.GetPetugas(c.Context(), search, role, status, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.PetugasUser{}
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
		"total":   total,
		"limit":   limit,
	})
}

func (h *UserHandler) CreatePetugas(c fiber.Ctx) error {
	var req models.CreatePetugasRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload data petugas tidak valid"})
	}

	if req.Nama == "" || req.Email == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Nama lengkap dan email petugas wajib diisi"})
	}

	petugas, err := h.svc.CreatePetugas(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Akun petugas admin berhasil dibuat",
		"data":    petugas,
	})
}

func (h *UserHandler) UpdatePetugas(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdatePetugasRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	if err := h.svc.UpdatePetugas(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Data petugas berhasil diperbarui"})
}

func (h *UserHandler) VerifyPetugas(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.VerifyPetugas(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Petugas berhasil disetujui & diverifikasi"})
}

func (h *UserHandler) DeletePetugas(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.DeletePetugas(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Petugas berhasil dihapus"})
}

// ==========================================
// 2. HANDLER PEGAWAI (SYNC OTOMATIS KE MANAJEMEN CUTI)
// ==========================================

func (h *UserHandler) GetPegawai(c fiber.Ctx) error {
	search := c.Query("search")
	unitKerja := c.Query("unit_kerja")
	status := c.Query("status")
	limit := 50
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 {
		limit = l
	}
	offset := 0
	if p, err := strconv.Atoi(c.Query("page")); err == nil && p > 1 {
		offset = (p - 1) * limit
	}

	data, total, err := h.svc.GetPegawai(c.Context(), search, unitKerja, status, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.PegawaiUser{}
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
		"total":   total,
		"limit":   limit,
	})
}

func (h *UserHandler) CreatePegawai(c fiber.Ctx) error {
	var req models.CreatePegawaiRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if req.Nama == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Nama pegawai wajib diisi"})
	}

	pegawai, err := h.svc.CreatePegawai(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data":    pegawai,
		"message": "Data pegawai berhasil ditambahkan dan otomatis disinkronkan ke Manajemen Cuti",
	})
}

func (h *UserHandler) UpdatePegawai(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdatePegawaiRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if req.Nama == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Nama pegawai tidak boleh kosong"})
	}

	if err := h.svc.UpdatePegawai(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data pegawai berhasil diperbarui dan otomatis disinkronkan ke Manajemen Cuti",
	})
}

func (h *UserHandler) DeletePegawai(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.DeletePegawai(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data pegawai berhasil dihapus dan disinkronkan dari sistem",
	})
}

// ==========================================
// 3. HANDLER PEMOHON MASYARAKAT
// ==========================================

func (h *UserHandler) GetPemohon(c fiber.Ctx) error {
	search := c.Query("search")
	metodeLogin := c.Query("metode_login")
	status := c.Query("status")
	limit := 50
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 {
		limit = l
	}
	offset := 0
	if p, err := strconv.Atoi(c.Query("page")); err == nil && p > 1 {
		offset = (p - 1) * limit
	}

	data, total, err := h.svc.GetPemohon(c.Context(), search, metodeLogin, status, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.PemohonUser{}
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
		"total":   total,
		"limit":   limit,
	})
}

func (h *UserHandler) UpdatePemohon(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdatePemohonRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	if err := h.svc.UpdatePemohon(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Data pemohon berhasil diperbarui"})
}

func (h *UserHandler) DeletePemohon(c fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.DeletePemohon(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Akun pemohon berhasil dihapus"})
}

// ==========================================
// 4. STATISTIK PENGGUNA
// ==========================================

func (h *UserHandler) GetUserStats(c fiber.Ctx) error {
	stats, err := h.svc.GetUserStats(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": stats})
}

