package repository

import (
	"context"
	"encoding/json"

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

func (r *CutiRepository) FindByNip(ctx context.Context, nip string) (map[string]interface{}, error) {
	// 1. Query pegawai by NIP from ptsp_data_cuti_pegawai (public schema / default search path)
	var pegawaiID string
	var nama, pNip, jabatan string
	err := r.db.QueryRow(ctx, `
		SELECT id::text, nama, COALESCE(nip, ''), COALESCE(jabatan, '-') 
		FROM kemenag_ptsp.ptsp_data_cuti_pegawai
		WHERE nip = $1 LIMIT 1
	`, nip).Scan(&pegawaiID, &nama, &pNip, &jabatan)

	if err != nil {
		// Fallback query to profiles_pegawai via profiles
		err = r.db.QueryRow(ctx, `
			SELECT pp.id::text, COALESCE(p.full_name, 'Pegawai'), COALESCE(pp.nip, ''), COALESCE(pp.jabatan, '-')
			FROM kemenag_ptsp.profiles_pegawai pp
			JOIN kemenag_ptsp.profiles p ON p.id = pp.profile_id
			WHERE pp.nip = $1 LIMIT 1
		`, nip).Scan(&pegawaiID, &nama, &pNip, &jabatan)
		if err != nil {
			return nil, err
		}
	}

	// 2. Query rekap cuti dari ptsp_rekap_cuti_tahunan (pegawai_id is UUID)
	var totalCuti, cutiTahun1, cutiTahun2, cutiPenting, cutiBesar, cutiBersalin, cutiSakit, sisaCuti, tahunTarget int
	var cutiTahunanRaw []byte
	errRekap := r.db.QueryRow(ctx, `
		SELECT COALESCE(jumlah_cuti, 12), COALESCE(cuti_tahun_1, 0), COALESCE(cuti_tahun_2, 0), 
		       COALESCE(cuti_alasan_penting, 0), COALESCE(cuti_besar, 0), COALESCE(cuti_bersalin, 0), 
		       COALESCE(cuti_sakit, 0), COALESCE(sisa_cuti, 12), COALESCE(tahun_target, 2026), 
		       COALESCE(cuti_tahunan::text, '[]')
		FROM kemenag_ptsp.ptsp_rekap_cuti_tahunan WHERE pegawai_id::text = $1 ORDER BY tahun_target DESC LIMIT 1
	`, pegawaiID).Scan(&totalCuti, &cutiTahun1, &cutiTahun2, &cutiPenting, &cutiBesar, &cutiBersalin, &cutiSakit, &sisaCuti, &tahunTarget, &cutiTahunanRaw)

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
		"totalCuti":    totalCuti,
		"cutiTahun1":   cutiTahun1,
		"cutiTahun2":   cutiTahun2,
		"cutiTahunan":  cutiTahunanTerpakai,
		"cutiPenting":  cutiPenting,
		"cutiBesar":    cutiBesar,
		"cutiBersalin": cutiBersalin,
		"cutiSakit":    cutiSakit,
		"sisaCuti":     sisaCuti,
		"tahun":        tahunTarget,
		"status":       "Aktif",
	}, nil
}


func (r *CutiRepository) FindAll(ctx context.Context, userID string) ([]models.DataCutiPegawai, error) {
	query := `
		SELECT id, pegawai_id, jenis_cuti, tanggal_mulai, tanggal_selesai, alasan, status, created_at
		FROM kemenag_ptsp.ptsp_permohonan_cuti WHERE 1=1
	`
	args := []interface{}{}
	query += " ORDER BY created_at DESC LIMIT 100"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
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
		INSERT INTO kemenag_ptsp.ptsp_data_cuti_pegawai (user_id, jenis_cuti, tanggal_mulai, tanggal_selesai, keterangan, status)
		VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id
	`, req.UserID, req.JenisCuti, req.TanggalMulai, req.TanggalSelesai, req.Keterangan).Scan(&newID)

	return newID, err
}

func (r *CutiRepository) UpdateStatus(ctx context.Context, id string, req models.UpdateCutiStatusRequest) error {
	switch req.Status {
	case "approved_atasan":
		_, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.ptsp_pengajuan_cuti
			SET status_atasan = 'approved', catatan_atasan = NULLIF($1,''), ttd_atasan = NULLIF($2,''), updated_at = NOW()
			WHERE id = $3::uuid
		`, req.Catatan, req.Signature, id)
		return err
	case "approved_kepala":
		_, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.ptsp_pengajuan_cuti
			SET status_kepala = 'approved', status = 'approved', catatan_kepala = NULLIF($1,''), ttd_kepala = NULLIF($2,''), updated_at = NOW()
			WHERE id = $3::uuid
		`, req.Catatan, req.Signature, id)
		return err
	default:
		_, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.ptsp_pengajuan_cuti SET status = $1, komentar_pimpinan = NULLIF($2,''), updated_at = NOW() WHERE id = $3::uuid
		`, req.Status, req.Catatan, id)
		return err
	}
}

// --- Laporan Kinerja Harian (LKH) ---

func (r *CutiRepository) GetLKH(ctx context.Context, userID string) ([]models.LaporanKinerja, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, user_id::text, tanggal::text, waktu_pelaksanaan, kegiatan_tugas_jabatan, hasil, bukti_dukung_url, status, created_at
		FROM kemenag_ptsp.ptsp_laporan_kinerja
		WHERE user_id = $1::uuid ORDER BY tanggal DESC, created_at DESC LIMIT 100
	`, userID)
	if err != nil {
		return nil, err
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
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_laporan_kinerja WHERE id = $1::uuid`, id)
	return err
}


// --- Admin: CRUD Data Master Pegawai ---

func (r *CutiRepository) AdminListPegawai(ctx context.Context, search string) ([]models.CutiPegawaiMaster, error) {
	query := `SELECT id::text, COALESCE(nama,''), COALESCE(nip,''), COALESCE(jabatan,''), COALESCE(unit_kerja,''), COALESCE(golongan,''), COALESCE(jenis_pegawai,'')
		FROM kemenag_ptsp.ptsp_data_cuti_pegawai WHERE 1=1`
	args := []interface{}{}
	if search != "" {
		query += " AND (nama ILIKE $1 OR nip ILIKE $1)"
		args = append(args, "%"+search+"%")
	}
	query += " ORDER BY nama ASC LIMIT 200"
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []models.CutiPegawaiMaster
	for rows.Next() {
		var p models.CutiPegawaiMaster
		if err := rows.Scan(&p.ID, &p.Nama, &p.Nip, &p.Jabatan, &p.UnitKerja, &p.Golongan, &p.JenisPegawai); err == nil {
			result = append(result, p)
		}
	}
	return result, nil
}

func (r *CutiRepository) AdminCreatePegawai(ctx context.Context, req models.CreateCutiPegawaiRequest) (*models.CutiPegawaiMaster, error) {
	var p models.CutiPegawaiMaster
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_data_cuti_pegawai (nama, nip, jabatan, unit_kerja, golongan, jenis_pegawai)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id::text, nama, COALESCE(nip,''), COALESCE(jabatan,''), COALESCE(unit_kerja,''), COALESCE(golongan,''), COALESCE(jenis_pegawai,'')
	`, req.Nama, req.Nip, req.Jabatan, req.UnitKerja, req.Golongan, req.JenisPegawai).
		Scan(&p.ID, &p.Nama, &p.Nip, &p.Jabatan, &p.UnitKerja, &p.Golongan, &p.JenisPegawai)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *CutiRepository) AdminUpdatePegawai(ctx context.Context, id string, req models.UpdateCutiPegawaiRequest) (*models.CutiPegawaiMaster, error) {
	var p models.CutiPegawaiMaster
	err := r.db.QueryRow(ctx, `
		UPDATE kemenag_ptsp.ptsp_data_cuti_pegawai
		SET nama=$1, jabatan=$2, unit_kerja=$3, golongan=$4, jenis_pegawai=$5, updated_at=NOW()
		WHERE id=$6
		RETURNING id::text, nama, COALESCE(nip,''), COALESCE(jabatan,''), COALESCE(unit_kerja,''), COALESCE(golongan,''), COALESCE(jenis_pegawai,'')
	`, req.Nama, req.Jabatan, req.UnitKerja, req.Golongan, req.JenisPegawai, id).
		Scan(&p.ID, &p.Nama, &p.Nip, &p.Jabatan, &p.UnitKerja, &p.Golongan, &p.JenisPegawai)
	if err != nil {
		return nil, err
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
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_rekap_cuti_tahunan
			(pegawai_id, tahun_target, jumlah_cuti, cuti_tahun_1, cuti_tahun_2, cuti_alasan_penting, cuti_besar, cuti_bersalin, cuti_sakit, sisa_cuti)
		VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id::text, pegawai_id::text, tahun_target, jumlah_cuti, cuti_tahun_1, cuti_tahun_2, cuti_alasan_penting, cuti_besar, cuti_bersalin, cuti_sakit, sisa_cuti
	`, req.PegawaiID, req.TahunTarget, req.JumlahCuti, req.CutiTahun1, req.CutiTahun2, req.CutiAlasanPenting, req.CutiBesar, req.CutiBersalin, req.CutiSakit, req.SisaCuti).
		Scan(&rk.ID, &rk.PegawaiID, &rk.TahunTarget, &rk.JumlahCuti, &rk.CutiTahun1, &rk.CutiTahun2, &rk.CutiAlasanPenting, &rk.CutiBesar, &rk.CutiBersalin, &rk.CutiSakit, &rk.SisaCuti)
	if err != nil {
		return nil, err
	}
	return &rk, nil
}

func (r *CutiRepository) AdminUpdateRekap(ctx context.Context, id string, req models.UpdateRekapCutiRequest) (*models.RekapCutiTahunan, error) {
	var rk models.RekapCutiTahunan
	err := r.db.QueryRow(ctx, `
		UPDATE kemenag_ptsp.ptsp_rekap_cuti_tahunan
		SET tahun_target=$1, jumlah_cuti=$2, cuti_tahun_1=$3, cuti_tahun_2=$4,
		    cuti_alasan_penting=$5, cuti_besar=$6, cuti_bersalin=$7, cuti_sakit=$8, sisa_cuti=$9, updated_at=NOW()
		WHERE id=$10
		RETURNING id::text, pegawai_id::text, tahun_target, jumlah_cuti, cuti_tahun_1, cuti_tahun_2, cuti_alasan_penting, cuti_besar, cuti_bersalin, cuti_sakit, sisa_cuti
	`, req.TahunTarget, req.JumlahCuti, req.CutiTahun1, req.CutiTahun2, req.CutiAlasanPenting, req.CutiBesar, req.CutiBersalin, req.CutiSakit, req.SisaCuti, id).
		Scan(&rk.ID, &rk.PegawaiID, &rk.TahunTarget, &rk.JumlahCuti, &rk.CutiTahun1, &rk.CutiTahun2, &rk.CutiAlasanPenting, &rk.CutiBesar, &rk.CutiBersalin, &rk.CutiSakit, &rk.SisaCuti)
	if err != nil {
		return nil, err
	}
	return &rk, nil
}

func (r *CutiRepository) AdminDeleteRekap(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.ptsp_rekap_cuti_tahunan WHERE id=$1`, id)
	return err
}

func (r *CutiRepository) AdminRolloverTahunan(ctx context.Context, tahunTujuan int) (int, error) {
	var count int
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_rekap_cuti_tahunan
			(pegawai_id, tahun_target, jumlah_cuti, sisa_cuti)
		SELECT pegawai_id, $1, 12, 12
		FROM kemenag_ptsp.ptsp_data_cuti_pegawai
		WHERE id NOT IN (
			SELECT pegawai_id FROM kemenag_ptsp.ptsp_rekap_cuti_tahunan WHERE tahun_target=$1
		)
		RETURNING COUNT(*)
	`, tahunTujuan).Scan(&count)
	if err != nil {
		// If no rows to return, that's ok
		return 0, nil
	}
	return count, nil
}
