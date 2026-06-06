import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err, paginated } from '@/lib/utils/response'

// GET /api/simpanan?page=1&limit=20&jenis=WADIAH&status=AKTIF
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page   = parseInt(searchParams.get('page')  ?? '1')
    const limit  = parseInt(searchParams.get('limit') ?? '20')
    const jenis  = searchParams.get('jenis')
    const status = searchParams.get('status')
    const from   = (page - 1) * limit

    let query = supabase
      .from('simpanan')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (jenis)  query = query.eq('jenis', jenis)
    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) return err(error.message)

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch {
    return err('Internal server error', 500)
  }
}

// POST /api/simpanan — catat simpanan baru
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const body = await req.json()
    const { user_id, nama, jenis, nominal, tenor_bulan, catatan } = body

    if (!user_id || !nama || !jenis || !nominal) {
      return err('Field wajib: user_id, nama, jenis, nominal')
    }
    if (jenis === 'MUDHARABAH' && !tenor_bulan) {
      return err('Tenor bulan wajib diisi untuk Mudharabah')
    }

    const { data, error } = await supabaseAdmin
      .from('simpanan')
      .insert({ user_id, nama, jenis, nominal, tenor_bulan, catatan })
      .select()
      .single()

    if (error) return err(error.message)

    // Catat ke kas_mutasi
    await supabaseAdmin.from('kas_mutasi').insert({
      tgl:       data.tgl_setor,
      tipe:      'SIMPANAN_MASUK',
      pos:       'UMUM',
      nominal:   data.nominal,
      arah:      'MASUK',
      ref_table: 'simpanan',
      ref_id:    data.id,
      catatan:   `Setor simpanan ${jenis} - ${nama}`
    })

    return ok(data, 201)
  } catch {
    return err('Internal server error', 500)
  }
}
