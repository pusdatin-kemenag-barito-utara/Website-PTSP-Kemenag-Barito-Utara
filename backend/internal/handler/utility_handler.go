package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/service"
	"ptsp-kemenag-backend/internal/storage"
)

// ─────────────────────────────────────────
// ChatHandler — Asisten Virtual PTSP (AI)
// ─────────────────────────────────────────

type ChatHandler struct {
	cfg       *config.Config
	serviceSvc *service.ServiceService
}

func NewChatHandler(cfg *config.Config, serviceSvc *service.ServiceService) *ChatHandler {
	return &ChatHandler{cfg: cfg, serviceSvc: serviceSvc}
}

const baseSystemPrompt = `Anda adalah asisten virtual resmi Kemenag Kabupaten Barito Utara untuk Portal PTSP (Pelayanan Terpadu Satu Pintu).

ATURAN PENTING:
- Jawab SINGKAT, maksimal 2-3 kalimat saja.
- Gunakan bahasa Indonesia yang formal, sopan, dan ramah (Gunakan sapaan "Bapak/Ibu" atau "Saudara").
- Jika memberikan daftar persyaratan atau langkah-langkah, gunakan format list dengan tanda hubung "-" di awal setiap baris agar rapi.
- DILARANG MENGGUNAKAN simbol bintang dua (**) atau format Markdown bold. Tulis teks secara biasa tanpa simbol asterisks (**).
- Jaga jawaban agar tetap terstruktur, padat, dan jelas.
- Jika tidak tahu jawabannya atau sistem ragu, arahkan pengguna untuk menghubungi WhatsApp Call Center PTSP SI-ATAK melalui link https://wa.me/6285117491212 (nomor 0851-1749-1212).

DATA ORGANISASI & JABATAN PIMPINAN KEMENAG BARITO UTARA:

PIMPINAN PUSAT (KEMENAG RI):
- Menteri Agama Republik Indonesia: KH. Nasaruddin Umar (Dilantik 21 Oktober 2024).
- Wakil Menteri Agama: Muhammad Syafi'i.

PIMPINAN & PEJABAT STRUKTUR DAERAH (KEMENAG KABUPATEN BARITO UTARA):
- Kepala Kantor Kemenag Barito Utara: H. Arbaja, S.Ag., M.A.P
- Kepala Subbagian Tata Usaha: Sony Anwari Husni, S.Pd
- Kepala Seksi Pendidikan Madrasah: Handayani, S.Pd.I
- Kepala Seksi Pendidikan Agama Islam: H. Bakti Tawaddin, M.Pd
- Kepala Seksi Pendidikan Diniyah & Pondok Pesantren: Supian, SE
- Kepala Seksi Bimbingan Masyarakat Islam: Almubasir, S.Pd.I
- Penyelenggara Zakat & Wakaf: Hasan Fauzi, S.Ag
- Penyelenggara Hindu: Wandi, SH.AH
- Pengembang Sistem, IT & Pengelola Portal PTSP: Muhammad Nazilah, S.E. (Pegawai Kepegawaian, Sub Bagian Tata Usaha)

LAYANAN PUBLIK & PTSP SI-ATAK:
1. LAYANAN NIKAH: Pendaftaran via SIMKAH (simkah4.kemenag.go.id). Syarat umum: N1, N2, N4, FC KTP, FC KK, Akta Cerai/Kematian (jika ada), dan pas foto 2x3 & 4x6 background biru.
2. SERTIFIKASI HALAL: Melalui aplikasi SEHATI (Sertifikasi Halal Gratis) / ptsp.halal.go.id BPJPH.
3. LEGALISIR IJAZAH: Membawa Ijazah/STTB asli dan fotokopi (maksimal 5 lembar).
4. LAYANAN HAJI & UMRAH: Layanan Haji & Umrah tidak lagi di bawah Kementerian Agama. Informasi haji ditangani oleh badan/instansi yang berwenang.
5. SELURUH LAYANAN PTSP GRATIS / Rp 0 (Kecuali PNBP Nikah di luar KUA Rp 600.000 via Bank).

KONTAK DETAIL:
- Alamat: Jl. Ahmad Yani No.126, Muara Teweh, Barito Utara, Kalteng 73811.
- Telepon: (0519) 21269
- WhatsApp Resmi SI-ATAK: 0851-1749-1212
- Jam Kerja: Senin-Kamis 07.30-16.00 WIB, Jumat 07.30-16.30 WIB
- Motto: "Ikhlas Beramal"
`

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func (h *ChatHandler) getDatabaseKnowledgeContext(ctx context.Context) string {
	services, err := h.serviceSvc.GetServicesWithItems(ctx)
	if err != nil || len(services) == 0 {
		return ""
	}

	var sb strings.Builder
	sb.WriteString("\n\nKATALOG LAYANAN DARI DATABASE REAL-TIME PTSP:\n")
	for _, s := range services {
		sb.WriteString(fmt.Sprintf("\n- Kategori/Layanan: %s", s.Name))
		if s.RequirementsText != nil && *s.RequirementsText != "" {
			sb.WriteString(fmt.Sprintf(" (Persyaratan umum: %s)", *s.RequirementsText))
		}
		for _, item := range s.Items {
			sb.WriteString(fmt.Sprintf("\n  * Sub-Layanan: %s", item.Name))
			if item.EstimatedTime != nil && *item.EstimatedTime != "" {
				sb.WriteString(fmt.Sprintf(" | Estimasi: %s", *item.EstimatedTime))
			}
		}
	}
	return sb.String()
}

type chatRequestBody struct {
	Messages []chatMessage `json:"messages"`
}

func (h *ChatHandler) Chat(c *fiber.Ctx) error {
	var body chatRequestBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	dbContext := h.getDatabaseKnowledgeContext(c.Context())
	fullSystemPrompt := baseSystemPrompt + dbContext

	formattedMessages := append([]chatMessage{{Role: "system", Content: fullSystemPrompt}}, body.Messages...)

	failMsg := func(provider string, err error) {
		fmt.Printf("⚠️ %s AI Engine failed: %v\n", provider, err)
	}

	// 1. Groq
	if h.cfg.GroqAPIKey != "" {
		if answer, ok := h.callOpenAICompatible(fullSystemPrompt, formattedMessages, "https://api.groq.com/openai/v1/chat/completions", "llama-3.3-70b-versatile", h.cfg.GroqAPIKey); ok {
			return c.JSON(fiber.Map{"content": answer})
		} else {
			failMsg("Groq", fmt.Errorf("%s", answer))
		}
	}

	// 2. Gemini
	if h.cfg.GeminiAPIKey != "" {
		for _, model := range []string{"gemini-2.0-flash", "gemini-1.5-flash"} {
			if answer, ok := h.callGemini(fullSystemPrompt, body.Messages, model); ok {
				return c.JSON(fiber.Map{"content": answer})
			} else {
				failMsg("Gemini("+model+")", fmt.Errorf("%s", answer))
			}
		}
	}

	// 3. Mistral
	if h.cfg.MistralAPIKey != "" {
		if answer, ok := h.callOpenAICompatible(fullSystemPrompt, formattedMessages, "https://api.mistral.ai/v1/chat/completions", "mistral-small-latest", h.cfg.MistralAPIKey); ok {
			return c.JSON(fiber.Map{"content": answer})
		} else {
			failMsg("Mistral", fmt.Errorf("%s", answer))
		}
	}

	// 4. OpenRouter
	if h.cfg.OpenRouterAPIKey != "" {
		appUrl := h.cfg.FrontendOrigin
		for _, model := range []string{"google/gemini-2.0-flash-exp:free", "meta-llama/llama-3.3-70b-instruct:free", "deepseek/deepseek-r1:free"} {
			if answer, ok := h.callOpenAICompatibleWithReferer(fullSystemPrompt, formattedMessages, model, appUrl); ok {
				return c.JSON(fiber.Map{"content": answer})
			} else {
				failMsg("OpenRouter("+model+")", fmt.Errorf("%s", answer))
			}
		}
	}

	// Fallback statis
	lastUserMsg := ""
	if len(body.Messages) > 0 {
		lastUserMsg = strings.ToLower(body.Messages[len(body.Messages)-1].Content)
	}
	fallbackText := "Halo Bapak/Ibu, salam dari PTSP Kemenag Barito Utara! Ada yang bisa kami bantu mengenai pendaftaran layanan, syarat dokumen, atau informasi keagamaan?"
	switch {
	case strings.Contains(lastUserMsg, "nikah") || strings.Contains(lastUserMsg, "kawin"):
		fallbackText = "Untuk pendaftaran nikah dapat diakses melalui portal SIMKAH (simkah4.kemenag.go.id). Syarat umum meliputi formulir N1, N2, N4, FC KTP, KK, Akta Nikah/Cerai/Kematian (jika ada), serta foto 2x3 & 4x6 latar biru. Seluruh layanan PTSP gratis!"
	case strings.Contains(lastUserMsg, "halal") || strings.Contains(lastUserMsg, "sertifikat"):
		fallbackText = "Pendaftaran Sertifikasi Halal Gratis (SEHATI) dapat diajukan melalui portal ptsp.halal.go.id BPJPH. Persyaratan utama melampirkan NIB dan dokumen data usaha."
	case strings.Contains(lastUserMsg, "ijazah") || strings.Contains(lastUserMsg, "legalisir"):
		fallbackText = "Untuk legalisir ijazah/STTB, silakan membawa Ijazah asli beserta fotokopi maksimal 5 lembar ke Kantor Kemenag Barito Utara pada jam kerja."
	case strings.Contains(lastUserMsg, "pimpinan") || strings.Contains(lastUserMsg, "kepala") || strings.Contains(lastUserMsg, "pejabat"):
		fallbackText = "Kepala Kantor Kemenag Barito Utara saat ini dijabat oleh H. Arbaja, S.Ag., M.A.P, dan Kasubbag TU dijabat oleh Sony Anwari Husni, S.Pd."
	case strings.Contains(lastUserMsg, "kontak") || strings.Contains(lastUserMsg, "alamat") || strings.Contains(lastUserMsg, "wa"):
		fallbackText = "Kantor Kemenag Barito Utara berlokasi di Jl. Ahmad Yani No. 126, Muara Teweh. WhatsApp Resmi SI-ATAK: 0851-1749-1212. Jam kerja: Senin-Kamis 07.30-16.00 WIB & Jumat 07.30-16.30 WIB."
	}
	return c.JSON(fiber.Map{"content": fallbackText})
}

func (h *ChatHandler) callOpenAICompatible(systemPrompt string, messages []chatMessage, endpoint, model, apiKey string) (string, bool) {
	finalMessages := messages
	if systemPrompt != "" && (len(messages) == 0 || messages[0].Role != "system") {
		finalMessages = append([]chatMessage{{Role: "system", Content: systemPrompt}}, messages...)
	}
	payload := map[string]interface{}{
		"model":       model,
		"messages":    finalMessages,
		"temperature": 0.7,
		"max_tokens":  800,
	}
	return h.postJSON(endpoint, payload, apiKey)
}

func (h *ChatHandler) callOpenAICompatibleWithReferer(systemPrompt string, messages []chatMessage, model, appUrl string) (string, bool) {
	finalMessages := messages
	if systemPrompt != "" && (len(messages) == 0 || messages[0].Role != "system") {
		finalMessages = append([]chatMessage{{Role: "system", Content: systemPrompt}}, messages...)
	}
	endpoint := "https://openrouter.ai/api/v1/chat/completions"
	payload := map[string]interface{}{
		"model":       model,
		"messages":    finalMessages,
		"temperature": 0.7,
	}
	return h.postJSONWithHeaders(endpoint, payload, map[string]string{
		"Authorization": "Bearer " + h.cfg.OpenRouterAPIKey,
		"HTTP-Referer":  appUrl,
		"X-Title":       "PTSP Kemenag Barito Utara",
	})
}

func (h *ChatHandler) callGemini(systemPrompt string, messages []chatMessage, model string) (string, bool) {
	contents := make([]map[string]interface{}, 0, len(messages))
	for _, m := range messages {
		role := "user"
		if m.Role == "assistant" {
			role = "model"
		}
		contents = append(contents, map[string]interface{}{
			"role":  role,
			"parts": []map[string]interface{}{{"text": m.Content}},
		})
	}
	payload := map[string]interface{}{
		"contents": contents,
		"systemInstruction": map[string]interface{}{
			"parts": []map[string]interface{}{{"text": systemPrompt}},
		},
	}
	endpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, h.cfg.GeminiAPIKey)
	return h.postJSON(endpoint, payload, "")
}

func (h *ChatHandler) postJSON(endpoint string, payload interface{}, apiKey string) (string, bool) {
	headers := make(map[string]string)
	if apiKey != "" {
		headers["Authorization"] = "Bearer " + apiKey
	}
	return h.postJSONWithHeaders(endpoint, payload, headers)
}

func (h *ChatHandler) postJSONWithHeaders(endpoint string, payload interface{}, headers map[string]string) (string, bool) {
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", false
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewReader(bodyBytes))
	if err != nil {
		return "", false
	}
	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		if v != "" && v != "Bearer " {
			req.Header.Set(k, v)
		}
	}
	req.Header.Set("Authorization", headers["Authorization"])

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", false
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil || resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return string(respBytes), false
	}

	var data struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := json.Unmarshal(respBytes, &data); err != nil {
		return "gagal decode respons", false
	}
	if data.Error.Message != "" {
		return data.Error.Message, false
	}
	if len(data.Choices) > 0 && data.Choices[0].Message.Content != "" {
		return data.Choices[0].Message.Content, true
	}
	if len(data.Candidates) > 0 && len(data.Candidates[0].Content.Parts) > 0 {
		return data.Candidates[0].Content.Parts[0].Text, data.Candidates[0].Content.Parts[0].Text != ""
	}
	return "respons kosong", false
}

// ─────────────────────────────────────────
// FilesHandler — Resolve path R2 & proxy dokumen
// ─────────────────────────────────────────

type FilesHandler struct {
	storage *storage.R2Storage
}

func NewFilesHandler(r2 *storage.R2Storage) *FilesHandler {
	return &FilesHandler{storage: r2}
}

// ResolveFile menerjemahkan path (r2:...) lalu redirect ke URL file publik backend.
func (h *FilesHandler) ResolveFile(c *fiber.Ctx) error {
	path := c.Query("path")
	if path == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Parameter path wajib diisi"})
	}

	key := strings.TrimPrefix(path, "r2:")
	target := h.storage.GetURL(key)
	return c.Redirect(target, fiber.StatusFound)
}

// Stats mengembalikan jumlah file & total volume data di penyimpanan.
func (h *FilesHandler) Stats(c *fiber.Ctx) error {
	fileCount, usage, err := h.storage.GetStats(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"cloudflareR2": fiber.Map{
			"usage":     usage,
			"fileCount": fileCount,
		},
	})
}

// ProxyFile mengambil dokumen remote dan mengirimkannya inline (menghindari X-Frame-Options).
func (h *FilesHandler) ProxyFile(c *fiber.Ctx) error {
	fileUrlStr := c.Query("url")
	if fileUrlStr == "" {
		return c.Status(400).SendString("URL file tidak boleh kosong")
	}

	parsed, err := url.Parse(fileUrlStr)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return c.Status(400).SendString("URL file tidak valid")
	}

	req, err := http.NewRequestWithContext(c.Context(), "GET", fileUrlStr, nil)
	if err != nil {
		return c.Status(500).SendString("Terjadi kesalahan saat memproses dokumen")
	}
	req.Header.Set("Accept", "application/pdf,image/*,*/*")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("⚠️ ProxyFile error: %v\n", err)
		return c.Status(500).SendString("Terjadi kesalahan saat memproses dokumen")
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return c.Status(resp.StatusCode).SendString(fmt.Sprintf("Gagal mengambil dokumen (%d)", resp.StatusCode))
	}

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/pdf"
	}
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(500).SendString("Terjadi kesalahan saat memproses dokumen")
	}

	c.Set("Content-Type", contentType)
	c.Set("Content-Disposition", "inline")
	c.Set("Cache-Control", "public, max-age=3600")
	c.Set("X-Frame-Options", "SAMEORIGIN")
	return c.Status(200).Send(data)
}

// ─────────────────────────────────────────
// ImpersonateHandler — Link masuk pegawai (Super Admin)
// ─────────────────────────────────────────

type ImpersonateHandler struct {
	cfg     *config.Config
	cutiSvc *service.CutiService
}

func NewImpersonateHandler(cfg *config.Config, cutiSvc *service.CutiService) *ImpersonateHandler {
	return &ImpersonateHandler{cfg: cfg, cutiSvc: cutiSvc}
}

func (h *ImpersonateHandler) GenerateImpersonateLink(c *fiber.Ctx) error {
	var req struct {
		Nip string `json:"nip"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	nip := strings.TrimSpace(req.Nip)
	if nip == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "NIP tidak boleh kosong."})
	}
	if h.cfg.SupabaseURL == "" || h.cfg.SupabaseServiceRole == "" {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Konfigurasi Supabase admin belum tersedia di backend."})
	}

	// Data profil pegawai (opsional)
	name, jabatan, unitKerja := fmt.Sprintf("Pegawai %s", nip), "-", "-"
	if data, err := h.cutiSvc.GetByNip(c.Context(), nip); err == nil && data != nil {
		if status, ok := data["status"].(string); ok && status != "" {
			name = fmt.Sprintf("Pegawai %s", nip)
		}
	}

	email := fmt.Sprintf("%s@kemenag.go.id", nip)
	origin := fmt.Sprintf("%s://%s", strings.TrimSuffix(c.Protocol(), ":443"), c.Hostname())
	if forwarded := c.Get("x-forwarded-host"); forwarded != "" {
		proto := c.Get("x-forwarded-proto")
		if proto == "" {
			if strings.Contains(forwarded, "localhost") {
				proto = "http"
			} else {
				proto = "https"
			}
		}
		origin = fmt.Sprintf("%s://%s", proto, forwarded)
	}

	payload := map[string]interface{}{
		"type":  "magiclink",
		"email": email,
		"options": map[string]string{
			"redirectTo": origin + "/pegawai",
		},
	}
	bodyBytes, _ := json.Marshal(payload)

	reqUrl := strings.TrimRight(h.cfg.SupabaseURL, "/") + "/auth/v1/admin/generate_link"
	httpReq, err := http.NewRequestWithContext(c.Context(), "POST", reqUrl, bytes.NewReader(bodyBytes))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Gagal membuat link masuk. Coba lagi."})
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("apikey", h.cfg.SupabaseServiceRole)
	httpReq.Header.Set("Authorization", "Bearer "+h.cfg.SupabaseServiceRole)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Gagal membuat link masuk. Coba lagi."})
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil || resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Gagal membuat link masuk. Coba lagi."})
	}

	var linkData struct {
		Properties struct {
			ActionLink string `json:"action_link"`
		} `json:"properties"`
	}
	if err := json.Unmarshal(respBytes, &linkData); err != nil || linkData.Properties.ActionLink == "" {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Gagal membuat link masuk. Coba lagi."})
	}

	magicLink := linkData.Properties.ActionLink
	if parsedLink, err := url.Parse(magicLink); err == nil {
		token := parsedLink.Query().Get("token")
		magicLink = fmt.Sprintf("%s/auth/verify?token=%s&type=magiclink&next=/pegawai", origin, token)
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"name":      name,
		"jabatan":   jabatan,
		"unitKerja": unitKerja,
		"role":      "pegawai",
		"magicLink": magicLink,
	})
}