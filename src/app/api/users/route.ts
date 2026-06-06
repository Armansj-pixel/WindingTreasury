import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err, paginated } from '@/lib/utils/response'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page   = parseInt(searchParams.get('page')   ?? '1')
    const limit  = parseInt(searchParams.get('limit')  ?? '20')
    const status = searchParams.get('status')
    const from   = (page - 1) * limit

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) return err(error.message)

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch {
    return err('Internal server error', 500)
  }
}
