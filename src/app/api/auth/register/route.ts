import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { err, ok } from '@/lib/utils/response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
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

    const body = await req.json()
    const { email, password, nama, departemen, no_hp, role, catatan } = body

    if (!email || !password || !nama) {
      return err('Field wajib: email, password, nama', 400)
    }

    if (password.length < 8) {
      return err('Password minimal 8 karakter', 400)
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: nama },
      })

    if (authError) return err(authError.message, 400)

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .update({
        nama,
        departemen: departemen ?? null,
        no_hp: no_hp ?? null,
        role: role ?? 'USER',
        catatan: catatan ?? null,
        status: 'AKTIF',
        is_locked: false,
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileError) return err(profileError.message, 500)

    return ok(
      {
        message: 'Anggota berhasil ditambahkan',
        user: profile,
      },
      201
    )
  } catch {
    return err('Internal server error', 500)
  }
}
