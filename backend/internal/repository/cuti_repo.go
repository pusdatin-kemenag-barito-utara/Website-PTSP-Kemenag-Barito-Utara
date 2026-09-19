package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"ptsp-kemenag-backend/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)


// CutiRepository menangani operasi DB untuk pengajuan cuti pegawai.
type CutiRepository struct {
	db *pgxpool.Pool
}

func NewCutiRepository(db *pgxpool.Pool) *CutiRepository {
	return &CutiRepository{db: db}
}

func (r *CutiRepository) GetPejabatNIPs(ctx context.Context) ([]string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT nip FROM kemenag_ptsp.profiles_pegawai
		WHERE tipe_pejabat IS NOT NULL AND nip IS NOT NULL
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nips []string
	for rows.Next() {
		var nip string
		if err := rows.Scan(&nip); err == nil {
			nips = append(nips, nip)
		}
	}
	return nips, nil
}

func (r *CutiRepository) GetPejabatList(ctx context.Context) ([]models.PejabatItem, error) {
	rows, err := r.db.Query(ctx, `
		SELECT 
			id::text, 
			COALESCE(nip, ''), 
			COALESCE(nama, 'Pegawai Kemenag'), 
			COALESCE(jabatan, ''), 
			COALESCE(unit_kerja, ''), 
			COALESCE(tipe_pejabat, ''),
			COALESCE(order_index, 999)
		FROM kemenag_ptsp.profiles_pegawai
		WHERE tipe_pejabat IS NOT NULL AND tipe_pejabat <> ''
		ORDER BY COALESCE(order_index, 999) ASC, nama ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.PejabatItem
	for rows.Next() {
		var p models.PejabatItem
		if err := rows.Scan(&p.ID, &p.Nip, &p.Nama, &p.Jabatan, &p.UnitKerja, &p.TipePejabat, &p.OrderIndex); err == nil {
			list = append(list, p)
		}
	}
	return list, nil
}

func (r *CutiRepository) UpsertPejabat(ctx context.Context, req models.UpsertPejabatRequest) error {
	if req.ID != "" {
		_, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.profiles_pegawai
			SET nama = $1, nip = $2, jabatan = $3, unit_kerja = $4, tipe_pejabat = $5, updated_at = NOW()
			WHERE id::text = $6
		`, req.Nama, req.Nip, req.Jabatan, req.UnitKerja, req.TipePejabat, req.ID)
		return err
	}
	_, err := r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.profiles_pegawai 
			(id, nama, nip, jabatan, unit_kerja, tipe_pejabat, role, status, is_verified, created_at, updated_at)
		VALUES 
			(gen_random_uuid(), $1, $2, $3, $4, $5, 'user', 'active', true, NOW(), NOW())
	`, req.Nama, req.Nip, req.Jabatan, req.UnitKerja, req.TipePejabat)
	return err
}

func (r *CutiRepository) DeletePejabat(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.profiles_pegawai
		SET tipe_pejabat = NULL, updated_at = NOW()
		WHERE id::text = $1
	`, id)
	return err
}

func (r *CutiRepository) ReorderPejabat(ctx context.Context, items []models.ReorderPejabatItem) error {
	for _, it := range items {
		_, _ = r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.profiles_pegawai
			SET order_index = $1, updated_at = NOW()
			WHERE id::text = $2
		`, it.OrderIndex, it.ID)
	}
	return nil
}

func (r *CutiRepository) FindByRequestID(ctx context.Context, requestID string) (map[string]interface{}, error) {
	var id, userID, jenisCuti, tglMulai, tglSelesai, alasan, status, unitKerja, noHp, atasanNip, statusAtasan, catatanAtasan, statusKepala, catatanKepala, masaKerjaTahun, masaKerjaBulan, alamatCuti, jenisPegawai string
	var ttdPemohon, ttdAtasan, ttdKepala *string
	var nama, nip, jabatan string

	err := r.db.QueryRow(ctx, `
		SELECT 
			c.id::text, 
			COALESCE(c.user_id::text, ''), 
			COALESCE(c.jenis_cuti, 'Cuti Tahunan'),
			COALESCE(c.tanggal_mulai::text, ''),
			COALESCE(c.tanggal_selesai::text, ''),
			COALESCE(c.alasan, ''),
			COALESCE(c.status, 'pending'),
			COALESCE(c.unit_kerja, ''),
			COALESCE(c.no_hp, ''),
			c.ttd_pemohon,
			COALESCE(c.atasan_nip, ''),
			COALESCE(c.status_atasan, 'menunggu'),
			COALESCE(c.catatan_atasan, ''),
			c.ttd_atasan,
			COALESCE(c.status_kepala, 'menunggu'),
			COALESCE(c.catatan_kepala, ''),
			c.ttd_kepala,
			COALESCE(c.masa_kerja_tahun, '0'),
			COALESCE(c.masa_kerja_bulan, '0'),
			COALESCE(c.alamat_cuti, ''),
			COALESCE(c.jenis_pegawai, 'PNS'),
			COALESCE(p.nama, ''),
			COALESCE(p.nip, ''),
			COALESCE(p.jabatan, '')
		FROM kemenag_ptsp.ptsp_pengajuan_cuti c
		LEFT JOIN kemenag_ptsp.profiles_pegawai p ON p.user_id = c.user_id OR p.id = c.user_id
		WHERE c.request_id::text = $1 OR c.id::text = $1
		LIMIT 1
	`, requestID).Scan(
		&id, &userID, &jenisCuti, &tglMulai, &tglSelesai, &alasan, &status, &unitKerja, &noHp,
		&ttdPemohon, &atasanNip, &statusAtasan, &catatanAtasan, &ttdAtasan,
		&statusKepala, &catatanKepala, &ttdKepala,
		&masaKerjaTahun, &masaKerjaBulan, &alamatCuti, &jenisPegawai,
		&nama, &nip, &jabatan,
	)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"id":             id,
		"userId":         userID,
		"jenisCuti":      jenisCuti,
		"tanggalMulai":   tglMulai,
		"tanggalSelesai": tglSelesai,
		"alasan":         alasan,
		"status":         status,
		"unitKerja":      unitKerja,
		"noHp":           noHp,
		"ttdPemohon":     ttdPemohon,
		"atasanNip":      atasanNip,
		"statusAtasan":   statusAtasan,
		"catatanAtasan":  catatanAtasan,
		"ttdAtasan":      ttdAtasan,
		"statusKepala":   statusKepala,
		"catatanKepala":  catatanKepala,
		"ttdKepala":      ttdKepala,
		"masaKerjaTahun": masaKerjaTahun,
		"masaKerjaBulan": masaKerjaBulan,
		"alamatCuti":     alamatCuti,
		"jenisPegawai":   jenisPegawai,
		"nama":           nama,
		"nip":            nip,
		"jabatan":        jabatan,
	}, nil
}

func (r *CutiRepository) FindByNip(ctx context.Context, nip string) (map[string]interface{}, error) {
	// 1. Query pegawai by NIP from ptsp_data_cuti_pegawai
	var pegawaiID string
	var nama, pNip, jabatan, unitKerja string
	err := r.db.QueryRow(ctx, `
		SELECT id::text, nama, COALESCE(nip, ''), COALESCE(jabatan, '-'), COALESCE(unit_kerja, '-') 
		FROM kemenag_ptsp.ptsp_data_cuti_pegawai
		WHERE nip = $1 LIMIT 1
	`, nip).Scan(&pegawaiID, &nama, &pNip, &jabatan, &unitKerja)

	if err != nil {
		// Fallback query to profiles_pegawai
		err = r.db.QueryRow(ctx, `
			SELECT pp.id::text, COALESCE(pp.nama, 'Pegawai'), COALESCE(pp.nip, ''), COALESCE(pp.jabatan, '-'), COALESCE(pp.unit_kerja, '-')
			FROM kemenag_ptsp.profiles_pegawai pp
			WHERE pp.nip = $1 LIMIT 1
		`, nip).Scan(&pegawaiID, &nama, &pNip, &jabatan, &unitKerja)
		if err != nil {
			return nil, err
		}
	}

	// 2. Query rekap cuti dari ptsp_rekap_cuti_tahunan (pegawai_id is UUID)
	var totalCuti, cutiTahun1, cutiTahun2, cutiPenting, cutiBesar, cutiBersalin, cutiSakit, cutiCLTN, sisaCuti, tahunTarget int
	var cutiTahunanRaw []byte
	errRekap := r.db.QueryRow(ctx, `
		SELECT COALESCE(jumlah_cuti, 12), COALESCE(cuti_tahun_1, 0), COALESCE(cuti_tahun_2, 0), 
		       COALESCE(cuti_alasan_penting, 0), COALESCE(cuti_besar, 0), COALESCE(cuti_bersalin, 0), 
		       COALESCE(cuti_sakit, 0), COALESCE(cuti_cltn, 0), COALESCE(sisa_cuti, 12), COALESCE(tahun_target, 2026), 
		       COALESCE(cuti_tahunan::text, '[]')
		FROM kemenag_ptsp.ptsp_rekap_cuti_tahunan WHERE pegawai_id::text = $1 ORDER BY tahun_target DESC LIMIT 1
	`, pegawaiID).Scan(&totalCuti, &cutiTahun1, &cutiTahun2, &cutiPenting, &cutiBesar, &cutiBersalin, &cutiSakit, &cutiCLTN, &sisaCuti, &tahunTarget, &cutiTahunanRaw)

	if errRekap != nil {
		totalCuti = 12
		sisaCuti = 12
		tahunTarget = 2026
	}

	// Hitung total cuti tahunan yang terpakai dari JSONB array cuti_tahunan: [0,0,0,0,2,0,0,0,0,0,0,0]
	cutiTahunanTerpakai := 0
	if len(cutiTahunanRaw) > 0 {
		var arr []int
		if jsonErr := json.Unmarshal(cutiTahunanRaw, &arr); jsonErr == nil {
			for _, val := range arr {
				cutiTahunanTerpakai += val
			}
		}
	}

	return map[string]interface{}{
		"name":         nama,
		"nip":          pNip,
		"jabatan":      jabatan,
		"unitKerja":    unitKerja,
		"totalCuti":    totalCuti,
		"cutiTahun1":   cutiTahun1,
		"cutiTahun2":   cutiTahun2,
		"cutiTahunan":  cutiTahunanTerpakai,
		"cutiPenting":  cutiPenting,
		"cutiBesar":    cutiBesar,
		"cutiBersalin": cutiBersalin,
		"cutiSakit":    cutiSakit,
		"cutiCltn":     cutiCLTN,
		"sisaCuti":     sisaCuti,
		"tahun":        tahunTarget,
		"status":       "Aktif",
	}, nil
}


func (r *CutiRepository) FindAll(ctx context.Context, userID string) ([]models.DataCutiPegawai, error) {
	query := `
		SELECT id::text, user_id::text, jenis_cuti, tanggal_mulai::text, tanggal_selesai::text, COALESCE(alasan, ''), status, created_at
		FROM kemenag_ptsp.ptsp_pengajuan_cuti WHERE 1=1
	`
	args := []interface{}{}
	if userID != "" {
		query += " AND user_id::text = $1"
		args = append(args, userID)
	}
	query += " ORDER BY created_at DESC LIMIT 100"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return []models.DataCutiPegawai{}, nil
	}
	defer rows.Close()

	var result []models.DataCutiPegawai
	for rows.Next() {
		var c models.DataCutiPegawai
		if err := rows.Scan(&c.ID, &c.UserID, &c.JenisCuti, &c.TanggalMulai, &c.TanggalSelesai, &c.Keterangan, &c.Status, &c.CreatedAt); err == nil {
			result = append(result, c)
		}
	}
	return result, nil
}

func (r *CutiRepository) Create(ctx context.Context, req models.CreateCutiRequest) (string, error) {
	var newID string
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_pengajuan_cuti (user_id, jenis_cuti, tanggal_mulai, tanggal_selesai, alasan, status)
		VALUES ($1::uuid, $2, $3::date, $4::date, $5, 'pending') RETURNING id::text
	`, req.UserID, req.JenisCuti, req.TanggalMulai, req.TanggalSelesai, req.Keterangan).Scan(&newID)

	return newID, err
}

func (r *CutiRepository) UpdateStatus(ctx context.Context, id string, req models.UpdateCutiStatusRequest) error {
	switch req.Status {
	case "approved_atasan":
		_, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.ptsp_pengajuan_cuti
			SET status_atasan = 'approved', catatan_atasan = NULLIF($1,''), ttd_atasan = NULLIF($2,''), updated_at = NOW()
			WHERE id::text = $3
		`, req.Catatan, req.Signature, id)
		return err
	case "approved_kepala":
		_, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.ptsp_pengajuan_cuti
			SET status_kepala = 'approved', status = 'approved', catatan_kepala = NULLIF($1,''), ttd_kepala = NULLIF($2,''), updated_at = NOW()
			WHERE id::text = $3
		`, req.Catatan, req.Signature, id)
		return err
	default:
		_, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.ptsp_pengajuan_cuti SET status = $1, komentar_pimpinan = NULLIF($2,''), updated_at = NOW() WHERE id::text = $3
		`, req.Status, req.Catatan, id)
		return err
	}
}

// --- Laporan Kinerja Harian (LKH) ---

func (r *CutiRepository) GetLKH(ctx context.Context, userID string, month, year int) ([]models.LaporanKinerja, error) {
	query := `
		SELECT id::text, user_id::text, tanggal::text, waktu_pelaksanaan, kegiatan_tugas_jabatan, hasil, bukti_dukung_url, status, created_at
		FROM kemenag_ptsp.ptsp_laporan_kinerja
		WHERE user_id::text = $1`
	args := []interface{}{userID}
	if month > 0 {
		args = append(args, month)
		query += fmt.Sprintf(` AND EXTRACT(MONTH FROM tanggal) = $%d`, len(args))
	}
	if year > 0 {
		args = append(args, year)
		query += fmt.Sprintf(` AND EXTRACT(YEAR FROM tanggal) = $%d`, len(args))
	}
	query += ` ORDER BY tanggal ASC, created_at ASC LIMIT 200`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return []models.LaporanKinerja{}, nil
	}
	defer rows.Close()

	var result []models.LaporanKinerja
	for rows.Next() {
		var l models.LaporanKinerja
		if err := rows.Scan(&l.ID, &l.UserID, &l.Tanggal, &l.WaktuPelaksanaan, &l.KegiatanTugasJabatan, &l.Hasil, &l.BuktiDukungURL, &l.Status, &l.CreatedAt); err == nil {
			result = append(result, l)
		}
	}
	return result, nil
}


func (r *CutiRepository) CreateLKH(ctx context.Context, req models.CreateLaporanKinerjaRequest) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_laporan_kinerja
			(user_id, tanggal, waktu_pelaksanaan, kegiatan_tugas_jabatan, hasil, bukti_dukung_url, status)
		VALUES ($1::uuid, $2::date, NULLIF($3,''), $4, $5, NULLIF($6,''), 'pending')
	`, req.UserID, req.Tanggal, req.WaktuPelaksanaan, req.KegiatanTugasJabatan, req.Hasil, req.BuktiDukungURL)
	return err
}

func (r *CutiRepository) DeleteLKH(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_laporan_kinerja WHERE id::text = $1`, id)
	return err
}

func (r *CutiRepository) AdminGetLKH(ctx context.Context, search, unitKerja, status, date string, month, year int) ([]models.AdminLaporanKinerjaItem, error) {
	query := `
		SELECT 
			lk.id::text, 
			lk.user_id::text, 
			COALESCE(pp.nama, '') as pegawai_nama,
			COALESCE(pp.nip, '') as pegawai_nip,
			COALESCE(pp.jabatan, '') as pegawai_jabatan,
			COALESCE(pp.unit_kerja, '') as pegawai_unit_kerja,
			pp.avatar_url as pegawai_avatar,
			lk.tanggal::text, 
			lk.waktu_pelaksanaan, 
			lk.kegiatan_tugas_jabatan, 
			lk.hasil, 
			lk.bukti_dukung_url, 
			lk.status, 
			lk.komentar_pimpinan, 
			lk.created_at, 
			lk.updated_at
		FROM kemenag_ptsp.ptsp_laporan_kinerja lk
		LEFT JOIN kemenag_ptsp.profiles_pegawai pp 
			ON (pp.user_id = lk.user_id OR pp.id = lk.user_id)
		WHERE 1=1`
	var args []interface{}

	if search != "" {
		args = append(args, "%"+search+"%")
		query += fmt.Sprintf(` AND (pp.nama ILIKE $%d OR pp.nip ILIKE $%d OR lk.kegiatan_tugas_jabatan ILIKE $%d)`, len(args), len(args), len(args))
	}
	if unitKerja != "" && unitKerja != "all" {
		args = append(args, unitKerja)
		query += fmt.Sprintf(` AND pp.unit_kerja = $%d`, len(args))
	}
	if status != "" && status != "all" {
		args = append(args, status)
		query += fmt.Sprintf(` AND lk.status = $%d`, len(args))
	}
	if date != "" {
		args = append(args, date)
		query += fmt.Sprintf(` AND lk.tanggal::text = $%d`, len(args))
	}
	if month > 0 {
		args = append(args, month)
		query += fmt.Sprintf(` AND EXTRACT(MONTH FROM lk.tanggal) = $%d`, len(args))
	}
	if year > 0 {
		args = append(args, year)
		query += fmt.Sprintf(` AND EXTRACT(YEAR FROM lk.tanggal) = $%d`, len(args))
	}

	query += ` ORDER BY lk.tanggal DESC, lk.created_at DESC LIMIT 500`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return []models.AdminLaporanKinerjaItem{}, err
	}
	defer rows.Close()

	var result []models.AdminLaporanKinerjaItem
	for rows.Next() {
		var item models.AdminLaporanKinerjaItem
		if err := rows.Scan(
			&item.ID,
			&item.UserID,
			&item.PegawaiNama,
			&item.PegawaiNIP,
			&item.PegawaiJabatan,
			&item.PegawaiUnitKerja,
			&item.PegawaiAvatar,
			&item.Tanggal,
			&item.WaktuPelaksanaan,
			&item.KegiatanTugasJabatan,
			&item.Hasil,
			&item.BuktiDukungURL,
			&item.Status,
			&item.KomentarPimpinan,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err == nil {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *CutiRepository) AdminUpdateLKHStatus(ctx context.Context, id, status string, komentar *string) error {
	query := `
		UPDATE kemenag_ptsp.ptsp_laporan_kinerja
		SET status = $1, komentar_pimpinan = $2, updated_at = NOW()
		WHERE id::text = $3
	`
	_, err := r.db.Exec(ctx, query, status, komentar, id)
	return err
}


// --- Admin: CRUD Data Master Pegawai ---

func (r *CutiRepository) AdminListPegawai(ctx context.Context, search string) ([]models.CutiPegawaiMaster, error) {
	query := `
		SELECT 
			p.id::text, p.no, COALESCE(p.nama,''), COALESCE(p.nip,''), COALESCE(p.jabatan,''), COALESCE(p.unit_kerja,''),
			COALESCE(r.id::text,''), COALESCE(r.pegawai_id::text,''), COALESCE(r.tahun_target,0),
			COALESCE(r.jumlah_cuti,12), COALESCE(r.cuti_tahun_1,0), COALESCE(r.cuti_tahun_2,0),
			COALESCE(r.cuti_tahunan, '[0,0,0,0,0,0,0,0,0,0,0,0]'::jsonb),
			COALESCE(r.cuti_alasan_penting,0), COALESCE(r.cuti_besar,0), COALESCE(r.cuti_bersalin,0),
			COALESCE(r.cuti_sakit,0), COALESCE(r.cuti_cltn,0), COALESCE(r.sisa_cuti,12)
		FROM kemenag_ptsp.ptsp_data_cuti_pegawai p
		LEFT JOIN kemenag_ptsp.ptsp_rekap_cuti_tahunan r ON r.pegawai_id = p.id
		WHERE 1=1`
	args := []interface{}{}
	if search != "" {
		query += " AND (p.nama ILIKE $1 OR p.nip ILIKE $1)"
		args = append(args, "%"+search+"%")
	}
	query += " ORDER BY p.no ASC NULLS LAST, p.nama ASC, r.tahun_target DESC NULLS LAST"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return []models.CutiPegawaiMaster{}, nil
	}
	defer rows.Close()

	// Map pegawai by ID to aggregate rekap rows with pre-allocated capacity
	pegawaiMap := make(map[string]*models.CutiPegawaiMaster, 350)
	pegawaiOrder := make([]string, 0, 350)
	zeroArray := []int{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}

	for rows.Next() {
		var pID, pNama, pNip, pJabatan, pUnitKerja string
		var pNo *int
		var rkID, rkPegawaiID string
		var rk models.RekapCutiTahunan
		var cutiTahunanRaw []byte

		if err := rows.Scan(
			&pID, &pNo, &pNama, &pNip, &pJabatan, &pUnitKerja,
			&rkID, &rkPegawaiID, &rk.TahunTarget,
			&rk.JumlahCuti, &rk.CutiTahun1, &rk.CutiTahun2,
			&cutiTahunanRaw,
			&rk.CutiAlasanPenting, &rk.CutiBesar, &rk.CutiBersalin,
			&rk.CutiSakit, &rk.CutiCLTN, &rk.SisaCuti,
		); err != nil {
			continue
		}

		if len(cutiTahunanRaw) > 0 && !bytes.Equal(cutiTahunanRaw, []byte("[0,0,0,0,0,0,0,0,0,0,0,0]")) {
			var ct []int
			if err := json.Unmarshal(cutiTahunanRaw, &ct); err == nil {
				rk.CutiTahunan = ct
			}
		}
		if len(rk.CutiTahunan) == 0 {
			rk.CutiTahunan = zeroArray
		}

		if _, exists := pegawaiMap[pID]; !exists {
			pegawaiMap[pID] = &models.CutiPegawaiMaster{
				ID:               pID,
				No:               pNo,
				Nama:             pNama,
				Nip:              pNip,
				Jabatan:          pJabatan,
				UnitKerja:        pUnitKerja,
				JenisPegawai:     "PNS",
				RekapCutiTahunan: []models.RekapCutiTahunan{},
			}
			pegawaiOrder = append(pegawaiOrder, pID)
		}

		// Only append rekap if this row has actual rekap data
		if rkID != "" && rk.TahunTarget > 0 {
			rk.ID = rkID
			rk.PegawaiID = rkPegawaiID
			pegawaiMap[pID].RekapCutiTahunan = append(pegawaiMap[pID].RekapCutiTahunan, rk)
		}
	}

	result := make([]models.CutiPegawaiMaster, 0, len(pegawaiOrder))
	for _, id := range pegawaiOrder {
		result = append(result, *pegawaiMap[id])
	}
	return result, nil
}

func (r *CutiRepository) AdminCreatePegawai(ctx context.Context, req models.CreateCutiPegawaiRequest) (*models.CutiPegawaiMaster, error) {
	var p models.CutiPegawaiMaster
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_data_cuti_pegawai (nama, nip, jabatan, unit_kerja, jenis_pegawai)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id::text, nama, COALESCE(nip,''), COALESCE(jabatan,''), COALESCE(unit_kerja,''), '', COALESCE(jenis_pegawai,'')
	`, req.Nama, req.Nip, req.Jabatan, req.UnitKerja, req.JenisPegawai).
		Scan(&p.ID, &p.Nama, &p.Nip, &p.Jabatan, &p.UnitKerja, &p.Golongan, &p.JenisPegawai)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *CutiRepository) AdminUpdatePegawai(ctx context.Context, id string, req models.UpdateCutiPegawaiRequest) (*models.CutiPegawaiMaster, error) {
	// 1. Ambil NIP lama terlebih dahulu untuk sinkronisasi dua arah
	var oldNip string
	_ = r.db.QueryRow(ctx, `SELECT COALESCE(nip, '') FROM kemenag_ptsp.ptsp_data_cuti_pegawai WHERE id::text = $1`, id).Scan(&oldNip)

	targetNip := strings.TrimSpace(req.Nip)
	if targetNip == "" {
		targetNip = strings.TrimSpace(oldNip)
	}

	var p models.CutiPegawaiMaster
	err := r.db.QueryRow(ctx, `
		UPDATE kemenag_ptsp.ptsp_data_cuti_pegawai
		SET nama = $1,
		    nip = CASE WHEN $2 != '' THEN $2 ELSE nip END,
		    jabatan = $3,
		    unit_kerja = $4,
		    jenis_pegawai = $5,
		    no = COALESCE($6, no),
		    updated_at = NOW()
		WHERE id::text = $7
		RETURNING id::text, nama, COALESCE(nip,''), COALESCE(jabatan,''), COALESCE(unit_kerja,''), '', COALESCE(jenis_pegawai,'')
	`, req.Nama, targetNip, req.Jabatan, req.UnitKerja, req.JenisPegawai, req.No, id).
		Scan(&p.ID, &p.Nama, &p.Nip, &p.Jabatan, &p.UnitKerja, &p.Golongan, &p.JenisPegawai)
	if err != nil {
		return nil, err
	}

	// 2. SINKRONISASI DUA ARAH OTOMATIS: Update juga di profiles_pegawai jika ada entri dengan NIP tersebut
	if targetNip != "" {
		lookupNip := strings.TrimSpace(oldNip)
		if lookupNip == "" {
			lookupNip = targetNip
		}
		_, _ = r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.profiles_pegawai
			SET nama = $1, nip = $2, jabatan = $3, unit_kerja = $4, updated_at = NOW()
			WHERE TRIM(nip) = TRIM($5) OR TRIM(nip) = TRIM($2)
		`, req.Nama, targetNip, req.Jabatan, req.UnitKerja, lookupNip)
	}

	return &p, nil
}

func (r *CutiRepository) AdminDeletePegawai(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_data_cuti_pegawai WHERE id=$1`, id)
	return err
}

// --- Admin: CRUD Rekap Cuti Tahunan ---

func (r *CutiRepository) AdminCreateRekap(ctx context.Context, req models.CreateRekapCutiRequest) (*models.RekapCutiTahunan, error) {
	var rk models.RekapCutiTahunan
	var cutiTahunanRaw []byte
	ctBytes, _ := json.Marshal(req.CutiTahunan)
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_rekap_cuti_tahunan
			(pegawai_id, tahun_target, jumlah_cuti, cuti_tahun_1, cuti_tahun_2, cuti_tahunan, cuti_alasan_penting, cuti_besar, cuti_bersalin, cuti_sakit, cuti_cltn, sisa_cuti)
		VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12)
		RETURNING id::text, pegawai_id::text, tahun_target, jumlah_cuti, cuti_tahun_1, cuti_tahun_2, cuti_tahunan, cuti_alasan_penting, cuti_besar, cuti_bersalin, cuti_sakit, COALESCE(cuti_cltn, 0), sisa_cuti
	`, req.PegawaiID, req.TahunTarget, req.JumlahCuti, req.CutiTahun1, req.CutiTahun2, string(ctBytes), req.CutiAlasanPenting, req.CutiBesar, req.CutiBersalin, req.CutiSakit, req.CutiCLTN, req.SisaCuti).
		Scan(&rk.ID, &rk.PegawaiID, &rk.TahunTarget, &rk.JumlahCuti, &rk.CutiTahun1, &rk.CutiTahun2, &cutiTahunanRaw, &rk.CutiAlasanPenting, &rk.CutiBesar, &rk.CutiBersalin, &rk.CutiSakit, &rk.CutiCLTN, &rk.SisaCuti)
	if err != nil {
		return nil, err
	}
	if len(cutiTahunanRaw) > 0 {
		_ = json.Unmarshal(cutiTahunanRaw, &rk.CutiTahunan)
	}
	return &rk, nil
}

func (r *CutiRepository) AdminUpdateRekap(ctx context.Context, id string, req models.UpdateRekapCutiRequest) (*models.RekapCutiTahunan, error) {
	var rk models.RekapCutiTahunan
	var cutiTahunanRaw []byte
	ctBytes, _ := json.Marshal(req.CutiTahunan)
	err := r.db.QueryRow(ctx, `
		UPDATE kemenag_ptsp.ptsp_rekap_cuti_tahunan
		SET tahun_target=$1, jumlah_cuti=$2, cuti_tahun_1=$3, cuti_tahun_2=$4, cuti_tahunan=$5::jsonb,
		    cuti_alasan_penting=$6, cuti_besar=$7, cuti_bersalin=$8, cuti_sakit=$9, cuti_cltn=$10, sisa_cuti=$11, updated_at=NOW()
		WHERE id=$12
		RETURNING id::text, pegawai_id::text, tahun_target, jumlah_cuti, cuti_tahun_1, cuti_tahun_2, cuti_tahunan, cuti_alasan_penting, cuti_besar, cuti_bersalin, cuti_sakit, COALESCE(cuti_cltn, 0), sisa_cuti
	`, req.TahunTarget, req.JumlahCuti, req.CutiTahun1, req.CutiTahun2, string(ctBytes), req.CutiAlasanPenting, req.CutiBesar, req.CutiBersalin, req.CutiSakit, req.CutiCLTN, req.SisaCuti, id).
		Scan(&rk.ID, &rk.PegawaiID, &rk.TahunTarget, &rk.JumlahCuti, &rk.CutiTahun1, &rk.CutiTahun2, &cutiTahunanRaw, &rk.CutiAlasanPenting, &rk.CutiBesar, &rk.CutiBersalin, &rk.CutiSakit, &rk.CutiCLTN, &rk.SisaCuti)
	if err != nil {
		return nil, err
	}
	if len(cutiTahunanRaw) > 0 {
		_ = json.Unmarshal(cutiTahunanRaw, &rk.CutiTahunan)
	}
	return &rk, nil
}

func (r *CutiRepository) AdminDeleteRekap(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_rekap_cuti_tahunan WHERE id=$1`, id)
	return err
}

func (r *CutiRepository) AdminRolloverTahunan(ctx context.Context, tahunTujuan int) (int, error) {
	tag, err := r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_rekap_cuti_tahunan
			(id, pegawai_id, tahun_target, jumlah_cuti, cuti_tahun_1, cuti_tahun_2, sisa_cuti, cuti_tahunan, created_at, updated_at)
		SELECT 
			gen_random_uuid(),
			p.id, 
			$1, 
			12 + LEAST(COALESCE(prev.sisa_cuti, 0), 6) + LEAST(COALESCE(prev.cuti_tahun_1, 0), 6),
			LEAST(COALESCE(prev.sisa_cuti, 0), 6),
			LEAST(COALESCE(prev.cuti_tahun_1, 0), 6),
			12 + LEAST(COALESCE(prev.sisa_cuti, 0), 6) + LEAST(COALESCE(prev.cuti_tahun_1, 0), 6),
			'[0,0,0,0,0,0,0,0,0,0,0,0]'::jsonb,
			NOW(),
			NOW()
		FROM kemenag_ptsp.ptsp_data_cuti_pegawai p
		LEFT JOIN kemenag_ptsp.ptsp_rekap_cuti_tahunan prev ON prev.pegawai_id = p.id AND prev.tahun_target = $1 - 1
		WHERE p.id NOT IN (
			SELECT pegawai_id FROM kemenag_ptsp.ptsp_rekap_cuti_tahunan WHERE tahun_target = $1
		)
	`, tahunTujuan)
	if err != nil {
		return 0, err
	}
	return int(tag.RowsAffected()), nil
}

func (r *CutiRepository) AdminSyncPusdatin(ctx context.Context) (int, error) {
	tag, err := r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_data_cuti_pegawai (nama, nip, jabatan, unit_kerja)
		SELECT 
			COALESCE(pp.nama, 'Pegawai Kemenag'),
			pp.nip,
			COALESCE(pp.jabatan, ''),
			COALESCE(pp.unit_kerja, 'Kantor Kementerian Agama')
		FROM kemenag_ptsp.profiles_pegawai pp
		WHERE pp.nip IS NOT NULL AND pp.nip != ''
		ON CONFLICT (nip) DO UPDATE SET
			nama = EXCLUDED.nama,
			jabatan = EXCLUDED.jabatan,
			unit_kerja = EXCLUDED.unit_kerja,
			updated_at = NOW();
	`)
	if err != nil {
		return 0, err
	}
	return int(tag.RowsAffected()), nil
}
