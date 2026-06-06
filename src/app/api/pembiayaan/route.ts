import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err, paginated } from '@/lib/utils/response'

// GET /api/pembiayaan?status=PENDING&jenis=QARDH
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page   = parseInt(searchParams.get('page')  ?? '1')
    const limit  = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status')
    const jenis  = searchParams.get('jenis')
    const from   = (page - 1) * limit

    let query = supabase
      .from('pembiayaan')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (status) query = query.eq('status', status)
    if (jenis)  query = query.eq('jenis', jenis)

    const { data, error, count } = await query
    if (error) return err(error.message)

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch {
    return err('Internal server error', 500)
  }
}

// POST /api/pembiayaan — ajukan pembiayaan baru
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const body = await req.json()
    const { user_id, nama, jenis, pokok, tenor_bulan, deskripsi_barang, catatan } = body

    if (!user_id || !nama || !jenis || !pokok || !tenor_bulan) {
      return err('Field wajib: user_id, nama, jenis, pokok, tenor_bulan')
    }

    // Ambil config margin & ujrah
    const { data: configs } = await supabaseAdmin
      .from('config')
      .select('config_key, config_value')
      .in('config_key', ['MURABAHAH_MARGIN_PCT', 'UJRAH_FLAT'])

    const cfgMap = Object.fromEntries(
      (configs ?? []).map(c => [c.config_key, parseFloat(c.config_value)])
    )

    const margin = jenis === 'MURABAHAH'
      ? Math.floor(pokok * (cfgMap['MURABAHAH_MARGIN_PCT'] ?? 0.08))
      : 0
    const ujrah = cfgMap['UJRAH_FLAT'] ?? 5000

    const { data, error } = await supabaseAdmin
      .from('pembiayaan')
      .insert({
        user_id, nama, jenis, pokok, margin, ujrah,
        tenor_bulan, deskripsi_barang,
        status: 'PENDING'
      })
      .select()
      .single()

    if (error) return err(error.message)

    return ok(data, 201)
  } catch {
    return err('Internal server error', 500)
  }
}
