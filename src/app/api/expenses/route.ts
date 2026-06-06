import { createClient }  from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ok, err, paginated } from '@/lib/utils/response'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page  = parseInt(searchParams.get('page')  ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const pos   = searchParams.get('pos')
    const from  = (page - 1) * limit

    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .order('tgl', { ascending: false })
      .range(from, from + limit - 1)

    if (pos) query = query.eq('pos', pos)

    const { data, error, count } = await query
    if (error) return err(error.message)

    return paginated(data ?? [], count ?? 0, page, limit)
  } catch {
    return err('Internal server error', 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const body = await req.json()
    const { tgl, deskripsi, nominal, pos, kategori, bukti_url, catatan } = body

    if (!deskripsi || !nominal || !pos || !kategori) {
      return err('Field wajib: deskripsi, nominal, pos, kategori')
    }

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert({ tgl, deskripsi, nominal, pos, kategori, bukti_url, dicatat_oleh: user.id, catatan })
      .select()
      .single()

    if (error) return err(error.message)

    // Catat ke kas_mutasi
    await supabaseAdmin.from('kas_mutasi').insert({
      tgl:       data.tgl,
      tipe:      'PENGELUARAN',
      pos:       pos,
      nominal:   nominal,
      arah:      'KELUAR',
      ref_table: 'expenses',
      ref_id:    data.id,
      dicatat_oleh: user.id,
      catatan:   deskripsi
    })

    return ok(data, 201)
  } catch {
    return err('Internal server error', 500)
  }
}
