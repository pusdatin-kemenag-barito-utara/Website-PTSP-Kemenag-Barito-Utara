package models

import "time"

// DataCutiPegawai merepresentasikan pengajuan cuti oleh pegawai.
type DataCutiPegawai struct {
	ID             string     `json:"id"`
	UserID         string     `json:"user_id"`
	JenisCuti      string     `json:"jenis_cuti"`
	TanggalMulai   time.Time  `json:"tanggal_mulai"`
	TanggalSelesai time.Time  `json:"tanggal_selesai"`
	Keterangan     *string    `json:"keterangan"`
	Status         string     `json:"status"`
	CreatedAt      time.Time  `json:"created_at"`
}

// CreateCutiRequest DTO untuk pengajuan cuti baru.
type CreateCutiRequest struct {
	UserID         string `json:"userId"`
	JenisCuti      string `json:"jenisCuti"`
	TanggalMulai   string `json:"tanggalMulai"`
	TanggalSelesai string `json:"tanggalSelesai"`
	Keterangan     string `json:"keterangan"`
}

// UpdateCutiStatusRequest DTO untuk admin approve/reject cuti.
type UpdateCutiStatusRequest struct {
	Status    string `json:"status"`
	Catatan   string `json:"catatan"`
	Signature string `json:"signature"`
}

// CutiPegawaiMaster merepresentasikan data master pegawai cuti.
type CutiPegawaiMaster struct {
	ID               string             `json:"id"`
	No               *int               `json:"no,omitempty"`
	Nama             string             `json:"nama"`
	Nip              string             `json:"nip"`
	Jabatan          string             `json:"jabatan"`
	UnitKerja        string             `json:"unitKerja"`
	Golongan         string             `json:"golongan"`
	JenisPegawai     string             `json:"jenisPegawai"`
	RekapCutiTahunan []RekapCutiTahunan `json:"rekapCutiTahunan"`
}

// CreateCutiPegawaiRequest DTO untuk admin menambah data master pegawai.
type CreateCutiPegawaiRequest struct {
	Nama      string `json:"nama"`
	Nip       string `json:"nip"`
	Jabatan   string `json:"jabatan"`
	UnitKerja string `json:"unitKerja"`
	Golongan  string `json:"golongan"`
	JenisPegawai string `json:"jenisPegawai"`
}

// UpdateCutiPegawaiRequest DTO untuk admin update data master pegawai.
type UpdateCutiPegawaiRequest struct {
	No           *int   `json:"no"`
	Nama         string `json:"nama"`
	Nip          string `json:"nip"`
	Jabatan      string `json:"jabatan"`
	UnitKerja    string `json:"unitKerja"`
	Golongan     string `json:"golongan"`
	JenisPegawai string `json:"jenisPegawai"`
}

// RekapCutiTahunan merepresentasikan rekap cuti tahunan pegawai.
type RekapCutiTahunan struct {
	ID                string `json:"id"`
	PegawaiID         string `json:"pegawaiId"`
	TahunTarget       int    `json:"tahunTarget"`
	JumlahCuti        int    `json:"jumlahCuti"`
	CutiTahun1        int    `json:"cutiTahun1"`
	CutiTahun2        int    `json:"cutiTahun2"`
	CutiTahunan       []int  `json:"cutiTahunan"`
	CutiAlasanPenting int    `json:"cutiAlasanPenting"`
	CutiBesar         int    `json:"cutiBesar"`
	CutiBersalin      int    `json:"cutiBersalin"`
	CutiSakit         int    `json:"cutiSakit"`
	CutiCLTN          int    `json:"cutiCltn"`
	SisaCuti          int    `json:"sisaCuti"`
}

// CreateRekapCutiRequest DTO untuk admin menambah rekap cuti.
type CreateRekapCutiRequest struct {
	PegawaiID         string `json:"pegawaiId"`
	TahunTarget       int    `json:"tahunTarget"`
	JumlahCuti        int    `json:"jumlahCuti"`
	CutiTahun1        int    `json:"cutiTahun1"`
	CutiTahun2        int    `json:"cutiTahun2"`
	CutiTahunan       []int  `json:"cutiTahunan"`
	CutiAlasanPenting int    `json:"cutiAlasanPenting"`
	CutiBesar         int    `json:"cutiBesar"`
	CutiBersalin      int    `json:"cutiBersalin"`
	CutiSakit         int    `json:"cutiSakit"`
	CutiCLTN          int    `json:"cutiCltn"`
	SisaCuti          int    `json:"sisaCuti"`
}

// UpdateRekapCutiRequest DTO untuk admin update rekap cuti.
type UpdateRekapCutiRequest = CreateRekapCutiRequest

// LaporanKinerja merepresentasikan data LKH pegawai.
type LaporanKinerja struct {
	ID                   string    `json:"id"`
	UserID               string    `json:"userId"`
	Tanggal              string    `json:"tanggal"`
	WaktuPelaksanaan     *string   `json:"waktuPelaksanaan"`
	KegiatanTugasJabatan string    `json:"kegiatanTugasJabatan"`
	Hasil                string    `json:"hasil"`
	BuktiDukungURL       *string   `json:"buktiDukungUrl"`
	Status               string    `json:"status"`
	CreatedAt            time.Time `json:"createdAt"`
}

// CreateLaporanKinerjaRequest DTO untuk membuat LKH.
type CreateLaporanKinerjaRequest struct {
	UserID               string  `json:"userId"`
	Tanggal              string  `json:"tanggal"`
	WaktuPelaksanaan     *string `json:"waktuPelaksanaan"`
	KegiatanTugasJabatan string  `json:"kegiatanTugasJabatan"`
	Hasil                string  `json:"hasil"`
	BuktiDukungURL       *string `json:"buktiDukungUrl"`
	Status               string  `json:"status"`
}

// BulkCreateLaporanKinerjaRequest DTO untuk import LKH bulk.
type BulkCreateLaporanKinerjaRequest struct {
	Items []CreateLaporanKinerjaRequest `json:"items"`
}

// AdminLaporanKinerjaItem merepresentasikan data LKH lengkap dengan profil pegawai untuk admin/atasan.
type AdminLaporanKinerjaItem struct {
	ID                   string    `json:"id"`
	UserID               string    `json:"userId"`
	PegawaiNama          string    `json:"pegawaiNama"`
	PegawaiNIP           string    `json:"pegawaiNip"`
	PegawaiJabatan       string    `json:"pegawaiJabatan"`
	PegawaiUnitKerja     string    `json:"pegawaiUnitKerja"`
	PegawaiAvatar        *string   `json:"pegawaiAvatar"`
	Tanggal              string    `json:"tanggal"`
	WaktuPelaksanaan     *string   `json:"waktuPelaksanaan"`
	KegiatanTugasJabatan string    `json:"kegiatanTugasJabatan"`
	Hasil                string    `json:"hasil"`
	BuktiDukungURL       *string   `json:"buktiDukungUrl"`
	Status               string    `json:"status"`
	KomentarPimpinan     *string   `json:"komentarPimpinan"`
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
}

// UpdateLKHStatusRequest DTO untuk update status LKH oleh pimpinan/admin.
type UpdateLKHStatusRequest struct {
	Status           string  `json:"status"`
	KomentarPimpinan *string `json:"komentarPimpinan"`
}

// PejabatItem merepresentasikan data atasan/pejabat berwenang cuti dari profiles_pegawai.
type PejabatItem struct {
	ID          string `json:"id"`
	Nip         string `json:"nip"`
	Nama        string `json:"nama"`
	Jabatan     string `json:"jabatan"`
	UnitKerja   string `json:"unitKerja"`
	TipePejabat string `json:"tipePejabat"`
	OrderIndex  int    `json:"orderIndex"`
}

// UpsertPejabatRequest DTO untuk simpan/update data atasan/pejabat cuti.
type UpsertPejabatRequest struct {
	ID          string `json:"id"`
	Nip         string `json:"nip"`
	Nama        string `json:"nama"`
	Jabatan     string `json:"jabatan"`
	UnitKerja   string `json:"unitKerja"`
	TipePejabat string `json:"tipePejabat"`
}

// ReorderPejabatItem DTO untuk perubahan urutan tampilan pejabat.
type ReorderPejabatItem struct {
	ID         string `json:"id"`
	OrderIndex int    `json:"orderIndex"`
}

