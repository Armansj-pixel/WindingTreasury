import { createClient } from '@/lib/supabase/server'
import { ok, err }      from '@/lib/utils/response'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return err('Email dan password wajib diisi')
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) return err('Email atau password salah', 401)

    // Ambil profile user dari tabel users
    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('id, nama, email, role, status, is_locked, departemen')
      .eq('id', data.user.id)
      .single()

    if (profileErr || !profile) {
      return err('Profil user tidak ditemukan', 404)
    }

    // Cek status akun
    if (profile.status === 'NONAKTIF') {
      await supabase.auth.signOut()
      return err('Akun Anda telah dinonaktifkan. Hubungi admin.', 403)
    }

    if (profile.status === 'BLACKLIST') {
      await supabase.auth.signOut()
      return err('Akun Anda telah diblokir. Hubungi admin.', 403)
    }

    if (profile.is_locked) {
      await supabase.auth.signOut()
      return err('Akun Anda terkunci karena belum membayar iuran. Hubungi admin.', 403)
    }

    return ok({
      user: profile,
      session: {
        access_token:  data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at:    data.session.expires_at
      }
    })
  } catch {
    return err('Internal server error', 500)
  }
}
