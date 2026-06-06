import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err }       from '@/lib/utils/response'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Cek yang memanggil adalah admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { data: caller } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (caller?.role !== 'ADMIN') {
      return err('Hanya admin yang bisa mendaftarkan anggota baru', 403)
    }

    const body = await req.json()
    const { email, password, nama, departemen, no_hp, role, catatan } = body

    if (!email || !password || !nama) {
      return err('Field wajib: email, password, nama')
    }
    if (password.length < 8) {
      return err('Password minimal 8 karakter')
    }

    // 1. Buat akun di Supabase Auth
    const { data: authData, error: authErr } = await supabaseAdmin
      .auth.admin.createUser({
        email,
        password,
        email_confirm: true,   // langsung verified, tidak perlu konfirmasi email
        user_metadata: { full_name: nama }
      })

    if (authErr) return err(authErr.message)

    // 2. Trigger handle_new_user() dari Patch v1.1 sudah otomatis
    //    buat baris di tabel users, tapi kita update dengan data lengkap
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('users')
      .update({
        nama,
        departemen,
        no_hp,
        role:   role ?? 'USER',
        catatan
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileErr) return err(profileErr.message)

    return ok({
      message: `Anggota ${nama} berhasil didaftarkan`,
      user:    profile
    }, 201)

  } catch {
    return err('Internal server error', 500)
  }
}
