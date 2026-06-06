import { createClient } from '@/lib/supabase/server'
import { ok, err } from '@/lib/utils/response'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const [summary, crr, kasPos] = await Promise.all([
      supabase.from('dashboard_summary').select('*').single(),
      supabase.from('crr_status').select('*').single(),
      supabase.from('kas_posisi').select('*'),
    ])

    if (summary.error) return err(summary.error.message)

    return ok({
      summary: summary.data,
      crr:     crr.data,
      kas_pos: kasPos.data
    })
  } catch (e) {
    return err('Internal server error', 500)
  }
}
