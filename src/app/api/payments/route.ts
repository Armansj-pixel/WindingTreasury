import { createClient }   from '@/lib/supabase/server'
import { supabaseAdmin }  from '@/lib/supabase/admin'
import { ok, err, paginated } from '@/lib/utils/response'

// GET /api/payments?page=1&limit=20&bulan=2025-06&user_id=xxx
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page   = parseInt(searchParams.get('page')  ?? '1')
    const limit  = parseInt(searchParams.get('limit') ?? '20')
    const bulan  = searchParams.get('bulan')
    const userId = searchParams.get('user_id')
    const from   = (page - 1) * limit

    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (bulan)  query = query.eq('bulan', bulan)
    if (userId) query = query.eq('user_id', userId)

    const { data, error, count } = await query
    if (error) return err(error.message)

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch {
    return err('Internal server error', 500)
  }
}

// POST /api/payments — catat iuran baru (admin only)
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const body = await req.json()
    const { user_id, nama, bulan, nominal, jenis, metode, catatan } = body

    if (!user_id || !nama || !bulan || !nominal || !jenis) {
      return err('Field wajib: user_id, nama, bulan, nominal, jenis')
    }

    // Insert via admin client agar trigger split berjalan
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id,
        nama,
        bulan,
        nominal,
        jenis:        jenis   ?? 'WAJIB',
        metode:       metode  ?? 'TUNAI',
        dicatat_oleh: user.id,
        catatan
      })
      .select()
      .single()

    if (error) return err(error.message)

    // Catat ke kas_mutasi
    await supabaseAdmin.from('kas_mutasi').insert({
      tgl:       data.tgl_bayar,
      tipe:      'IURAN_MASUK',
      pos:       'UMUM',
      nominal:   data.nominal,
      arah:      'MASUK',
      ref_table: 'payments',
      ref_id:    data.id,
      dicatat_oleh: user.id,
      catatan:   `Iuran ${jenis} ${nama} bulan ${bulan}`
    })

    return ok(data, 201)
  } catch {
    return err('Internal server error', 500)
  }
}
