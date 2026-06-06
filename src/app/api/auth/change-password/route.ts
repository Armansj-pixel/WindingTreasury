import { createClient } from '@/lib/supabase/server'
import { ok, err }      from '@/lib/utils/response'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { password_baru } = await req.json()

    if (!password_baru) return err('password_baru wajib diisi')
    if (password_baru.length < 8) return err('Password minimal 8 karakter')

    const { error } = await supabase.auth.updateUser({
      password: password_baru
    })

    if (error) return err(error.message)

    return ok({ message: 'Password berhasil diubah' })
  } catch {
    return err('Internal server error', 500)
  }
}
