import { createClient } from '@/lib/supabase/server'
import { ok, err }      from '@/lib/utils/response'

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) return err(error.message)
    return ok({ message: 'Logout berhasil' })
  } catch {
    return err('Internal server error', 500)
  }
}
