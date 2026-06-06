import { createClient } from '@/lib/supabase/server'
import { err, ok } from '@/lib/utils/response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return err('Unauthorized', 401)

    const { data: caller, error: callerError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerError) return err(callerError.message, 500)
    if (caller?.role !== 'ADMIN') return err('Forbidden', 403)

    const { data, error } = await supabase
      .from('users')
      .select('id, nama, email, departemen, role, status, no_hp, tgl_gabung, created_at')
      .order('created_at', { ascending: false })

    if (error) return err(error.message, 500)

    return ok(data)
  } catch {
    return err('Internal server error', 500)
  }
}
