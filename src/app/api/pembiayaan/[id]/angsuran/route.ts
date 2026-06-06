import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err } from '@/lib/utils/response'

// GET /api/pembiayaan/[id]/angsuran
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { id } = await params

    const { data, error } = await supabase
      .from('pembiayaan_angsuran')
      .select('*')
      .eq('pembiayaan_id', id)
      .order('cicilan_ke', { ascending: true })

    if (error) return err(error.message)
    return ok(data)
  } catch {
    return err('Internal server error', 500)
  }
}

// POST /api/pembiayaan/[id]/angsuran — bayar cicilan
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { id } = await params
    const body = await req.json()
    const { nominal_bayar, metode, komponen_pokok, komponen_margin, komponen_ujrah, denda_tazir } = body

    // Ambil data pembiayaan
    const { data: pmb, error: pmbErr } = await supabaseAdmin
      .from('pembiayaan')
      .select('*')
      .eq('id', id)
      .single()

    if (pmbErr || !pmb) return err('Pembiayaan tidak ditemukan', 404)
    if (pmb.status !== 'AKTIF') return err('Pembiayaan tidak dalam status AKTIF')

    const cicilan_ke = (pmb.cicilan_ke ?? 0) + 1

    // Insert angsuran
    const { data: angsuran, error: angErr } = await supabaseAdmin
      .from('pembiayaan_angsuran')
      .insert({
        pembiayaan_id: id,
        user_id:       pmb.user_id,
        nama:          pmb.nama,
        cicilan_ke,
        nominal_bayar,
        metode:        metode ?? 'TUNAI',
        komponen_pokok:  komponen_pokok  ?? 0,
        komponen_margin: komponen_margin ?? 0,
        komponen_ujrah:  komponen_ujrah  ?? 0,
        denda_tazir:     denda_tazir     ?? 0,
        dicatat_oleh:  user.id
      })
      .select()
      .single()

    if (angErr) return err(angErr.message)

    // Update sudah_dibayar & cicilan_ke di header pembiayaan
    const sudah_dibayar = (pmb.sudah_dibayar ?? 0) + nominal_bayar
    const sisa_tagihan  = (pmb.total_tagihan ?? 0) - sudah_dibayar
    const status_baru   = sisa_tagihan <= 0 ? 'LUNAS' : 'AKTIF'

    await supabaseAdmin
      .from('pembiayaan')
      .update({ sudah_dibayar, sisa_tagihan, cicilan_ke, status: status_baru })
      .eq('id', id)

    // Catat ke kas_mutasi
    await supabaseAdmin.from('kas_mutasi').insert({
      tipe:      'ANGSURAN_MASUK',
      pos:       'PRODUKTIF',
      nominal:   nominal_bayar,
      arah:      'MASUK',
      ref_table: 'pembiayaan_angsuran',
      ref_id:    angsuran.id,
      dicatat_oleh: user.id,
      catatan:   `Cicilan ke-${cicilan_ke} ${pmb.nama}`
    })

    return ok({ angsuran, status_pembiayaan: status_baru }, 201)
  } catch {
    return err('Internal server error', 500)
  }
}
