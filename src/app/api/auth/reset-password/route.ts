import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err }       from '@/lib/utils/response'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    // Hanya admin
    const { data: caller } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (caller?.role !== 'ADMIN') return err('Forbidden', 403)

    const { user_id, password_baru } = await req.json()

    if (!user_id || !password_baru) {
      return err('Field wajib: user_id, password_baru')
    }
    if (password_baru.length < 8) return err('Password minimal 8 karakter')

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: password_baru }
    )

    if (error) return err(error.message)

    return ok({ message: 'Password berhasil direset oleh admin' })
  } catch {
    return err('Internal server error', 500)
  }
}
