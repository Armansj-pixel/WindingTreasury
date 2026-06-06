export type UserRole   = 'ADMIN' | 'USER'
export type UserStatus = 'AKTIF' | 'NONAKTIF' | 'BLACKLIST'

export type User = {
  id:          string
  email:       string
  nama:        string
  departemen?: string
  role:        UserRole
  tgl_gabung:  string
  status:      UserStatus
  is_locked:   boolean
  lock_reason?: string
  no_hp?:      string
  catatan?:    string
  created_at:  string
  updated_at:  string
}

export type Payment = {
  id:              string
  payment_code:    string
  user_id:         string
  nama:            string
  bulan:           string
  tgl_bayar:       string
  nominal:         number
  jenis:           'WAJIB' | 'SUKARELA'
  metode:          'TUNAI' | 'TRANSFER' | 'QRIS'
  split_produktif?: number
  split_sosial?:   number
  split_ops?:      number
  dicatat_oleh?:   string
  catatan?:        string
  created_at:      string
}

export type Simpanan = {
  id:             string
  simpanan_code:  string
  user_id:        string
  nama:           string
  jenis:          'WADIAH' | 'MUDHARABAH'
  tgl_setor:      string
  nominal:        number
  tenor_bulan?:   number
  tgl_jatuh_tempo?: string
  status:         'AKTIF' | 'DICAIRKAN' | 'JATUH_TEMPO'
  tgl_cair?:      string
  bagi_hasil:     number
  catatan?:       string
  created_at:     string
  updated_at:     string
}

export type Pembiayaan = {
  id:                string
  pmb_code:          string
  user_id:           string
  nama:              string
  jenis:             'QARDH' | 'MURABAHAH'
  tgl_pengajuan:     string
  tgl_disetujui?:    string
  status:            'PENDING' | 'AKTIF' | 'LUNAS' | 'DITOLAK' | 'GAGAL_BAYAR'
  pokok:             number
  margin:            number
  ujrah:             number
  total_tagihan?:    number
  cicilan_per_bulan?: number
  tenor_bulan:       number
  sudah_dibayar:     number
  sisa_tagihan?:     number
  cicilan_ke:        number
  tgl_jatuh_tempo?:  string
  disetujui_oleh?:   string
  deskripsi_barang?: string
  alasan_tolak?:     string
  created_at:        string
  updated_at:        string
}

export type PembiayaanAngsuran = {
  id:               string
  angsuran_code:    string
  pembiayaan_id:    string
  user_id:          string
  nama:             string
  cicilan_ke:       number
  tgl_bayar:        string
  nominal_bayar:    number
  komponen_pokok:   number
  komponen_margin:  number
  komponen_ujrah:   number
  denda_tazir:      number
  metode:           'TUNAI' | 'TRANSFER' | 'QRIS'
  dicatat_oleh?:    string
  catatan?:         string
  created_at:       string
}

export type WindingKiosk = {
  id:             string
  txn_code:       string
  user_id:        string
  nama:           string
  tgl_txn:        string
  produk:         'PULSA' | 'TOKEN_PLN' | 'PAKET_DATA' | 'TAGIHAN_PDAM' | 'LAINNYA'
  provider:       string
  nominal_produk: number
  harga_jual:     number
  margin:         number
  no_tujuan:      string
  status:         'SUKSES' | 'GAGAL' | 'PENDING'
  dicatat_oleh?:  string
  catatan?:       string
  created_at:     string
}

export type Expense = {
  id:           string
  exp_code:     string
  tgl:          string
  deskripsi:    string
  nominal:      number
  pos:          'SOSIAL' | 'OPERASIONAL' | 'PRODUKTIF'
  kategori:     string
  dicatat_oleh?: string
  bukti_url?:   string
  catatan?:     string
  created_at:   string
}

export type SlaQueue = {
  id:              string
  sla_code:        string
  simpanan_id:     string
  user_id:         string
  nama:            string
  jenis_simpanan:  'WADIAH' | 'MUDHARABAH'
  nominal:         number
  tgl_request:     string
  tgl_cair_target: string
  status:          'ANTRE' | 'DIPROSES' | 'SELESAI' | 'DIBATALKAN'
  prioritas:       number
  catatan?:        string
  created_at:      string
  updated_at:      string
}

export type ShuCalc = {
  id:                         string
  periode:                    string
  user_id:                    string
  nama:                       string
  total_simpanan_mudharabah:  number
  pct_kontribusi:             number
  laba_kiosk_periode:         number
  laba_margin_periode:        number
  total_laba_dibagi:          number
  shu_diterima:               number
  status_bayar:               'BELUM_BAYAR' | 'SUDAH_BAYAR'
  created_at:                 string
}

export type Config = {
  id:           string
  config_key:   string
  config_value: string
  description?: string
  tipe:         string
  updated_at:   string
}

export type KasMutasi = {
  id:           string
  mutasi_code:  string
  tgl:          string
  tipe:         string
  pos:          'PRODUKTIF' | 'SOSIAL' | 'OPERASIONAL' | 'UMUM'
  nominal:      number
  arah:         'MASUK' | 'KELUAR'
  ref_table?:   string
  ref_id?:      string
  dicatat_oleh?: string
  catatan?:     string
  created_at:   string
}

export type DashboardSummary = {
  total_pemasukan:   number
  total_modal_kiosk: number
  total_laba_kiosk:  number
  total_pengeluaran: number
  pos_produktif:     number
  pos_sosial:        number
  pos_operasional:   number
  total_simpanan:    number
  dana_wadiah:       number
  dana_mudharabah:   number
  total_disalurkan:  number
  sisa_piutang:      number
  npl_count:         number
  anggota_aktif:     number
  akun_terkunci:     number
  antrean_sla:       number
  total_tazir:       number
}
