import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err } from '@/lib/utils/response'

// GET — ambil semua config (admin only)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { data, error } = await supabase
      .from('config')
      .select('*')
      .order('tipe', { ascending: true })

    if (error) return err(error.message)
    return ok(data)
  } catch {
    return err('Internal server error', 500)
  }
}

// PATCH — update 1 config key (admin only)
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const body = await req.json()
    const { config_key, config_value } = body

    if (!config_key || config_value === undefined) {
      return err('Field wajib: config_key, config_value')
    }

    const { data, error } = await supabaseAdmin
      .from('config')
      .update({ config_value, updated_at: new Date().toISOString() })
      .eq('config_key', config_key)
      .select()
      .single()

    if (error) return err(error.message)
    return ok(data)
  } catch {
    return err('Internal server error', 500)
  }
}
