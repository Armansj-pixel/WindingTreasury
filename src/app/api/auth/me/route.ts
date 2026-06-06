import { createClient } from '@/lib/supabase/server'
import { ok, err }      from '@/lib/utils/response'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return err('Unauthorized', 401)

    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('id, nama, email, role, status, is_locked, departemen, no_hp, tgl_gabung')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) return err('Profil tidak ditemukan', 404)

    return ok(profile)
  } catch {
    return err('Internal server error', 500)
  }
}
