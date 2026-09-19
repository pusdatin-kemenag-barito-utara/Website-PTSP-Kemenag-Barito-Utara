package middleware

import (
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
)

// ANSI Color Constants
const (
	colorReset   = "\033[0m"
	colorDim     = "\033[2m"
	colorBold    = "\033[1m"
	colorRed     = "\033[1;31m"
	colorGreen   = "\033[1;32m"
	colorYellow  = "\033[1;33m"
	colorBlue    = "\033[1;34m"
	colorMagenta = "\033[1;35m"
	colorCyan    = "\033[1;36m"
	colorWhite   = "\033[1;37m"
	colorGray    = "\033[90m"
)

// PrettyLogger menghasilkan middleware logger terminal yang ringkas, berwarna, dan jelas
func PrettyLogger() fiber.Handler {
	return func(c fiber.Ctx) error {
		path := c.Path()

		// Skip health check dan monitoring polling berkala agar terminal tidak bising
		if path == "/api/health" || path == "/api/v1/admin/system/status" {
			return c.Next()
		}

		start := time.Now()
		err := c.Next()
		latency := time.Since(start)

		status := c.Response().StatusCode()
		method := c.Method()

		// 1. Format Waktu (HH:MM:SS)
		timeStr := colorGray + start.Format("15:04:05") + colorReset

		// 2. Format Status Code & Warna
		var statusStr string
		switch status {
		case 200:
			statusStr = fmt.Sprintf("%s200 OK %s", colorGreen, colorReset)
		case 201:
			statusStr = fmt.Sprintf("%s201 CRE%s", colorGreen, colorReset)
		case 204:
			statusStr = fmt.Sprintf("%s204 NOC%s", colorGreen, colorReset)
		case 301, 302, 304, 307, 308:
			statusStr = fmt.Sprintf("%s%3d RED%s", colorCyan, status, colorReset)
		case 400:
			statusStr = fmt.Sprintf("%s400 BAD%s", colorYellow, colorReset)
		case 401:
			statusStr = fmt.Sprintf("%s401 AUT%s", colorYellow, colorReset)
		case 403:
			statusStr = fmt.Sprintf("%s403 FOR%s", colorYellow, colorReset)
		case 404:
			statusStr = fmt.Sprintf("%s404 NF %s", colorYellow, colorReset)
		case 500:
			statusStr = fmt.Sprintf("%s500 ERR%s", colorRed, colorReset)
		default:
			switch {
			case status < 300:
				statusStr = fmt.Sprintf("%s%3d OK %s", colorGreen, status, colorReset)
			case status < 400:
				statusStr = fmt.Sprintf("%s%3d RED%s", colorCyan, status, colorReset)
			case status < 500:
				statusStr = fmt.Sprintf("%s%3d BAD%s", colorYellow, status, colorReset)
			default:
				statusStr = fmt.Sprintf("%s%3d ERR%s", colorRed, status, colorReset)
			}
		}

		// 3. Format Kecepatan / Latency (bersih & ringkas)
		latencyStr := formatLatency(latency)

		// 4. Format Aksi CRUD (Method)
		crudStr := formatCRUD(method)

		// 5. Format Modul / Fitur (File/Bagian apa)
		moduleStr := formatModule(path)

		// 6. Format Path Ringkas (Trimming jika terlalu panjang)
		cleanPath := compactPath(path)

		// Cetak baris tunggal sejajar dan rapi
		fmt.Printf("%s | %s | %s | %s %s %s%s%s\n",
			timeStr,
			statusStr,
			latencyStr,
			crudStr,
			moduleStr,
			colorWhite,
			cleanPath,
			colorReset,
		)

		return err
	}
}

// formatLatency memformat durasi menjadi ringkas dengan warna
func formatLatency(d time.Duration) string {
	var formatted string
	var color string

	switch {
	case d < time.Millisecond:
		formatted = fmt.Sprintf("%4dµs", d.Microseconds())
		color = colorGreen
	case d < 250*time.Millisecond:
		formatted = fmt.Sprintf("%4dms", d.Milliseconds())
		color = colorGreen
	case d < time.Second:
		formatted = fmt.Sprintf("%4dms", d.Milliseconds())
		color = colorYellow
	default:
		formatted = fmt.Sprintf("%4.1fs", d.Seconds())
		color = colorYellow
	}

	return fmt.Sprintf("%s%6s%s", color, formatted, colorReset)
}

// formatCRUD mengubah HTTP Method menjadi aksi CRUD berwarna
func formatCRUD(method string) string {
	switch method {
	case "GET":
		return colorBlue + "[READ  ]" + colorReset
	case "POST":
		return colorGreen + "[CREATE]" + colorReset
	case "PUT", "PATCH":
		return colorYellow + "[UPDATE]" + colorReset
	case "DELETE":
		return colorRed + "[DELETE]" + colorReset
	case "OPTIONS":
		return colorDim + "[OPTION]" + colorReset
	default:
		return colorWhite + "[ACTION]" + colorReset
	}
}

// formatModule menentukan modul berdasarkan prefix path
func formatModule(path string) string {
	switch {
	case strings.HasPrefix(path, "/api/v1/auth"):
		return colorMagenta + "[Auth    ]" + colorReset
	case strings.HasPrefix(path, "/api/v1/users"):
		return colorCyan + "[Pengguna]" + colorReset
	case strings.HasPrefix(path, "/api/v1/admin/stats"):
		return colorGreen + "[Statistik]" + colorReset
	case strings.HasPrefix(path, "/api/v1/admin/requests"):
		return colorYellow + "[Permohonan]" + colorReset
	case strings.HasPrefix(path, "/api/v1/admin/users"):
		return colorCyan + "[AdmUser ]" + colorReset
	case strings.HasPrefix(path, "/api/v1/services"):
		return colorBlue + "[Layanan ]" + colorReset
	case strings.HasPrefix(path, "/api/v1/pegawai/cuti"):
		return colorCyan + "[DataCuti]" + colorReset
	case strings.HasPrefix(path, "/api/v1/pegawai"):
		return colorCyan + "[Pegawai ]" + colorReset
	case strings.HasPrefix(path, "/api/v1/guest-book"):
		return colorMagenta + "[BukuTamu]" + colorReset
	case strings.HasPrefix(path, "/api/v1/appointments"):
		return colorBlue + "[JanjiTmu]" + colorReset
	case strings.HasPrefix(path, "/api/v1/files"):
		return colorWhite + "[Storage ]" + colorReset
	case strings.HasPrefix(path, "/api/v1/master-options"):
		return colorCyan + "[Master  ]" + colorReset
	case strings.HasPrefix(path, "/api/v1/videos"):
		return colorCyan + "[Video   ]" + colorReset
	default:
		return colorGray + "[Umum    ]" + colorReset
	}
}

// compactPath merapikan path jika berisi UUID panjang agar tidak meluber
func compactPath(p string) string {
	parts := strings.Split(p, "/")
	for i, part := range parts {
		// Jika bagian berupa UUID panjang (36 char dengan tanda hubung)
		if len(part) == 36 && strings.Count(part, "-") == 4 {
			parts[i] = part[:8] + "…"
		}
	}
	return strings.Join(parts, "/")
}
