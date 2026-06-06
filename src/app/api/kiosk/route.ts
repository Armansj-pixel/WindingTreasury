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
    const from  = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('winding_kiosk')
      .select('*', { count: 'exact' })
      .order('tgl_txn', { ascending: false })
      .range(from, from + limit - 1)

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
    const { user_id, nama, produk, provider, nominal_produk, harga_jual, no_tujuan, catatan } = body

    if (!user_id || !produk || !provider || !nominal_produk || !harga_jual || !no_tujuan) {
      return err('Field wajib: user_id, produk, provider, nominal_produk, harga_jual, no_tujuan')
    }

    const { data, error } = await supabaseAdmin
      .from('winding_kiosk')
      .insert({
        user_id, nama, produk, provider,
        nominal_produk, harga_jual, no_tujuan,
        status:       'SUKSES',
        dicatat_oleh: user.id,
        catatan
      })
      .select()
      .single()

    if (error) return err(error.message)

    // Catat margin ke kas_mutasi
    if (data.margin > 0) {
      await supabaseAdmin.from('kas_mutasi').insert({
        tipe:      'MARGIN_KIOSK',
        pos:       'PRODUKTIF',
        nominal:   data.margin,
        arah:      'MASUK',
        ref_table: 'winding_kiosk',
        ref_id:    data.id,
        dicatat_oleh: user.id,
        catatan:   `Margin kiosk ${produk} - ${no_tujuan}`
      })
    }

    return ok(data, 201)
  } catch {
    return err('Internal server error', 500)
  }
}
