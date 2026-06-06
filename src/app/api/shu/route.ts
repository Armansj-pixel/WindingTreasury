import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err, paginated } from '@/lib/utils/response'

// GET /api/shu?periode=2025-06
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page    = parseInt(searchParams.get('page')    ?? '1')
    const limit   = parseInt(searchParams.get('limit')   ?? '20')
    const periode = searchParams.get('periode')
    const from    = (page - 1) * limit

    let query = supabase
      .from('shu_calc')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (periode) query = query.eq('periode', periode)

    const { data, error, count } = await query
    if (error) return err(error.message)

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch {
    return err('Internal server error', 500)
  }
}

// POST /api/shu — jalankan kalkulasi SHU periode tertentu (admin)
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const body = await req.json()
    const periode = body.periode ?? new Date().toISOString().slice(0, 7)

    const { data, error } = await supabaseAdmin
      .rpc('run_shu_mudharabah', { p_periode: periode })

    if (error) return err(error.message)
    return ok(data, 201)
  } catch {
    return err('Internal server error', 500)
  }
}
