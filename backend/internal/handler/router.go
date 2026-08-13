package handler

import (
	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/middleware"
	"ptsp-kemenag-backend/internal/repository"
	"ptsp-kemenag-backend/internal/service"
	"ptsp-kemenag-backend/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegisterRoutes mendaftarkan seluruh endpoint aplikasi secara terpusat & modular.
func RegisterRoutes(app *fiber.App, db *pgxpool.Pool, cfg *config.Config) {
	// --- Storage & File Services ---
	r2Storage := storage.NewR2Storage(cfg)
	fileSvc := service.NewFileService(cfg, r2Storage)

	// --- Repositories ---
	guestBookRepo := repository.NewGuestBookRepository(db)
	appointmentRepo := repository.NewAppointmentRepository(db)
	serviceRepo := repository.NewServiceRepository(db)
	requestRepo := repository.NewRequestRepository(db)
	userRepo := repository.NewUserRepository(db)
	cutiRepo := repository.NewCutiRepository(db)
	systemRepo := repository.NewSystemRepository(db)

	// --- Services ---
	guestBookSvc := service.NewGuestBookService(guestBookRepo, cfg)
	appointmentSvc := service.NewAppointmentService(appointmentRepo, cfg)
	serviceSvc := service.NewServiceService(serviceRepo, cfg)
	requestSvc := service.NewRequestService(requestRepo, cfg)
	userSvc := service.NewUserService(userRepo, cfg)
	cutiSvc := service.NewCutiService(cutiRepo, cfg)
	systemSvc := service.NewSystemService(systemRepo, cfg)

	// --- Handlers ---
	guestBookHdl := NewGuestBookHandler(guestBookSvc)
	appointmentHdl := NewAppointmentHandler(appointmentSvc)
	serviceHdl := NewServiceHandler(serviceSvc, fileSvc)
	requestHdl := NewRequestHandler(requestSvc, fileSvc)
	userHdl := NewUserHandler(userSvc, fileSvc)
	cutiHdl := NewCutiHandler(cutiSvc)
	cronHdl := NewCronHandler(systemSvc)
	chatHdl := NewChatHandler(cfg, serviceSvc)
	filesHdl := NewFilesHandler(r2Storage)
	impersonateHdl := NewImpersonateHandler(cfg, cutiSvc)

	// Static route fallback untuk file uploads lokal
	app.Static("/uploads", "./uploads")

	// ─────────────────────────────────────────────────────────
	// HEALTH CHECK
	// ─────────────────────────────────────────────────────────
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "PTSP Kemenag Backend (Clean Architecture v2.0)",
			"version": "2.0.0",
		})
	})

	// Register routes for both /api and /api/v1 prefixes
	for _, prefix := range []string{"/api", "/api/v1"} {
		api := app.Group(prefix)

		// Public Routes
		api.Get("/services", serviceHdl.GetServices)
		api.Get("/services/:slug", serviceHdl.GetServiceBySlug)
		api.Get("/master-options", serviceHdl.GetMasterOptions)
		api.Get("/videos", cronHdl.GetVideos)
		api.Get("/service-items/:serviceItemId/requirements", serviceHdl.GetRequirements)
		api.Get("/service-items/:serviceItemId/form-fields", serviceHdl.GetFormFields)

		api.Get("/guest-book", guestBookHdl.GetGuestBook)
		api.Post("/guest-book", guestBookHdl.CreateGuestBook)

		api.Get("/appointments", appointmentHdl.GetAppointments)
		api.Post("/appointments", appointmentHdl.CreateAppointment)

		api.Get("/requests/track/:requestNumber", requestHdl.TrackRequest)
		api.Get("/requests", requestHdl.GetRequests)
		api.Get("/requests/:id", requestHdl.GetRequestByID)
		api.Post("/requests", requestHdl.CreateByApplicant)
		api.Put("/requests/:id", requestHdl.UpdateByApplicant)
		api.Delete("/requests/:id", requestHdl.DeleteByApplicant)
		api.Post("/upload-document", requestHdl.UploadDocument)

		// Chat AI & File Utilities
		api.Post("/chat", chatHdl.Chat)
		api.Get("/files/resolve", filesHdl.ResolveFile)
		api.Get("/files/proxy", filesHdl.ProxyFile)
		api.Get("/files/stats", filesHdl.Stats)
		api.Get("/system/status", cronHdl.GetSystemStatus)
		api.Get("/admin/system/status", cronHdl.GetSystemStatus)
		api.Get("/users/:id", userHdl.GetUserByID)
		api.Patch("/users/:id/profile", userHdl.UpdateProfile)


		// Admin Routes (wajib autentikasi JWT Supabase)
		admin := api.Group("/admin", middleware.RequireJWT(cfg))
		admin.Get("/stats", requestHdl.GetDashboardStats)
		admin.Get("/search", userHdl.Search)

		admin.Get("/requests", requestHdl.GetRequests)
		admin.Get("/requests/:id", requestHdl.GetRequestByID)
		admin.Patch("/requests/:id/status", requestHdl.UpdateStatus)
		admin.Delete("/requests/:id", requestHdl.Delete)
		admin.Post("/requests/:id/documents", requestHdl.AttachDocument)
		admin.Post("/impersonate", impersonateHdl.GenerateImpersonateLink)

		admin.Get("/users", userHdl.GetUsers)
		admin.Get("/users/:id", userHdl.GetUserByID)
		admin.Patch("/users/:id", userHdl.UpdateUser)
		admin.Delete("/users/:id", userHdl.DeleteUser)

		// Self-profile update (nama & avatar — dipisah dari admin users)
		admin.Patch("/profile/:id", userHdl.UpdateProfile)

		admin.Get("/guest-book", guestBookHdl.GetGuestBook)
		admin.Delete("/guest-book/:id", guestBookHdl.DeleteGuestBook)
		admin.Get("/appointments", appointmentHdl.GetAppointments)
		admin.Patch("/appointments/:id", appointmentHdl.UpdateStatus)
		admin.Delete("/appointments/:id", appointmentHdl.Delete)

		admin.Get("/audit-logs", userHdl.GetAuditLogs)

		// Admin System Settings
		admin.Patch("/system/guest-book-mode", cronHdl.ToggleGuestBookMode)

		// Admin Master Options
		admin.Post("/master-options", serviceHdl.AdminUpsertMasterOption)
		admin.Delete("/master-options/:id", serviceHdl.AdminDeleteMasterOption)

		// Admin Services (Layanan)
		admin.Post("/services", serviceHdl.AdminCreateService)
		admin.Patch("/services/reorder", serviceHdl.AdminReorderServices)
		admin.Put("/services/:id", serviceHdl.AdminUpdateService)
		admin.Delete("/services/:id", serviceHdl.AdminDeleteService)

		// Admin Requirements
		admin.Post("/service-items/:serviceItemId/requirements", serviceHdl.AdminCreateRequirement)
		admin.Patch("/requirements/reorder", serviceHdl.AdminReorderRequirements)
		admin.Patch("/requirements/:id", serviceHdl.AdminUpdateRequirement)
		admin.Delete("/requirements/:id", serviceHdl.AdminDeleteRequirement)

		// Admin Service Items
		admin.Post("/services/:serviceId/items", serviceHdl.AdminCreateServiceItem)
		admin.Patch("/service-items/reorder", serviceHdl.AdminReorderServiceItems)
		admin.Patch("/service-items/:id", serviceHdl.AdminUpdateServiceItem)
		admin.Delete("/service-items/:id", serviceHdl.AdminDeleteServiceItem)

		// Admin Form Fields
		admin.Post("/service-items/:serviceItemId/form-fields", serviceHdl.AdminCreateFormField)
		admin.Patch("/form-fields/reorder", serviceHdl.AdminReorderFormFields)
		admin.Patch("/form-fields/:id", serviceHdl.AdminUpdateFormField)
		admin.Delete("/form-fields/:id", serviceHdl.AdminDeleteFormField)

		// Cron Jobs
		cron := api.Group("/cron")
		cron.Get("/cleanup-documents", cronHdl.CleanupDocuments)
		cron.Get("/keep-alive", cronHdl.KeepAlive)

		// Pegawai / Cuti / LKH
		pegawai := api.Group("/pegawai")
		pegawai.Get("/cuti", cutiHdl.GetCuti)
		pegawai.Post("/cuti", cutiHdl.CreateCuti)
		pegawai.Patch("/cuti/:id", cutiHdl.UpdateStatus)

		pegawai.Get("/lkh", cutiHdl.GetLKH)
		pegawai.Post("/lkh", cutiHdl.CreateLKH)
		pegawai.Post("/lkh/bulk", cutiHdl.BulkCreateLKH)
		pegawai.Delete("/lkh/:id", cutiHdl.DeleteLKH)


		// Admin Pegawai & Rekap Cuti
		adminCuti := admin.Group("/cuti")
		adminCuti.Get("/pegawai", cutiHdl.AdminListPegawai)
		adminCuti.Post("/pegawai", cutiHdl.AdminCreatePegawai)
		adminCuti.Put("/pegawai/:id", cutiHdl.AdminUpdatePegawai)
		adminCuti.Delete("/pegawai/:id", cutiHdl.AdminDeletePegawai)
		adminCuti.Post("/rekap", cutiHdl.AdminCreateRekap)
		adminCuti.Put("/rekap/:id", cutiHdl.AdminUpdateRekap)
		adminCuti.Delete("/rekap/:id", cutiHdl.AdminDeleteRekap)
		adminCuti.Post("/rollover", cutiHdl.AdminRolloverTahunan)
		adminCuti.Post("/sync-pusdatin", cutiHdl.AdminSyncPusdatin)
	}
}

