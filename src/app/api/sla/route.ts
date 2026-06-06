import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err, paginated } from '@/lib/utils/response'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page   = parseInt(searchParams.get('page')  ?? '1')
    const limit  = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status')
    const from   = (page - 1) * limit

    let query = supabase
      .from('sla_queue')
      .select('*', { count: 'exact' })
      .order('prioritas', { ascending: false })
      .order('tgl_request', { ascending: true })
      .range(from, from + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) return err(error.message)

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch {
    return err('Internal server error', 500)
  }
}

// POST — tambah antrean pencairan simpanan
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const body = await req.json()
    const { simpanan_id, catatan } = body

    if (!simpanan_id) return err('simpanan_id wajib diisi')

    // Ambil data simpanan
    const { data: smp, error: smpErr } = await supabaseAdmin
      .from('simpanan')
      .select('*')
      .eq('id', simpanan_id)
      .single()

    if (smpErr || !smp) return err('Simpanan tidak ditemukan', 404)
    if (smp.status !== 'AKTIF') return err('Simpanan tidak dalam status AKTIF')

    // Tentukan H+N berdasarkan jenis
    const { data: configs } = await supabaseAdmin
      .from('config')
      .select('config_key, config_value')
      .in('config_key', ['SLA_THRESHOLD', 'SLA_DAYS_WADIAH', 'SLA_DAYS_MUDHARABAH'])

    const cfg = Object.fromEntries(
      (configs ?? []).map(c => [c.config_key, parseFloat(c.config_value)])
    )

    const threshold = cfg['SLA_THRESHOLD'] ?? 1000000
    const days = smp.nominal >= threshold
      ? (smp.jenis === 'WADIAH'
          ? (cfg['SLA_DAYS_WADIAH'] ?? 3)
          : (cfg['SLA_DAYS_MUDHARABAH'] ?? 7))
      : 0

    const tgl_cair_target = new Date()
    tgl_cair_target.setDate(tgl_cair_target.getDate() + days)

    const { data, error } = await supabaseAdmin
      .from('sla_queue')
      .insert({
        simpanan_id,
        user_id:        smp.user_id,
        nama:           smp.nama,
        jenis_simpanan: smp.jenis,
        nominal:        smp.nominal,
        tgl_cair_target: tgl_cair_target.toISOString().split('T')[0],
        status:    'ANTRE',
        prioritas: smp.jenis === 'MUDHARABAH' ? 2 : 1,
        catatan
      })
      .select()
      .single()

    if (error) return err(error.message)
    return ok(data, 201)
  } catch {
    return err('Internal server error', 500)
  }
}
