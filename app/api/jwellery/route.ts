import { NextRequest, NextResponse } from 'next/server'
import { getRepositoryFactory } from '@/lib/repositories'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 60

// Public endpoint - no authentication required
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const jwelleryRepository = getRepositoryFactory(supabase).getJwelleryRepository()

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id') || undefined
    const search = searchParams.get('search') || undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (id) {
      const item = await jwelleryRepository.findById(id)
      if (!item || !item.is_active) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const product = {
        id: item.id,
        name: item.name,
        description: item.metal_type_purity || '',
        price: item.price,
        image_url: item.images?.[0] || '',
        images: item.images || [],
        category: 'Jwellery',
        stock_quantity: item.stock_quantity || 0,
        stock: item.stock_quantity || 0,
        active: item.is_active ?? true,
        is_active: item.is_active ?? true,
        specifications: {
          metal_type_purity: item.metal_type_purity || '',
          gross_weight_grams: item.gross_weight_grams ?? undefined,
          gemstone_type: item.gemstone_type || '',
          carat_weight: item.carat_weight ?? undefined,
          cut_and_shape: item.cut_and_shape || '',
          color_and_clarity: item.color_and_clarity || '',
          report_number: item.report_number || '',
          report_date: item.report_date || '',
          authorized_seal_signature: item.authorized_seal_signature || ''
        },
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }

      return NextResponse.json({ product }, { status: 200 })
    }

    let list
    if (search) {
      list = await jwelleryRepository.searchJwellery(search, limit)
    } else if (minPrice || maxPrice) {
      list = await jwelleryRepository.findJwelleryWithFilters(
        {
          minPrice,
          maxPrice,
          isActive: true
        },
        limit,
        offset
      )
    } else {
      const all = await jwelleryRepository.findAll(limit, offset)
      list = all.filter((x) => x.is_active)
    }

    const products = list
      .filter((x) => x.is_active)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.metal_type_purity || '',
        price: item.price,
        image_url: item.images?.[0] || '',
        images: item.images || [],
        category: 'Jwellery',
        stock_quantity: item.stock_quantity || 0,
        stock: item.stock_quantity || 0,
        active: item.is_active ?? true,
        is_active: item.is_active ?? true,
        specifications: {
          metal_type_purity: item.metal_type_purity || '',
          gross_weight_grams: item.gross_weight_grams ?? undefined,
          gemstone_type: item.gemstone_type || '',
          carat_weight: item.carat_weight ?? undefined,
          cut_and_shape: item.cut_and_shape || '',
          color_and_clarity: item.color_and_clarity || '',
          report_number: item.report_number || '',
          report_date: item.report_date || '',
          authorized_seal_signature: item.authorized_seal_signature || ''
        },
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }))

    return NextResponse.json({ products }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching jwellery:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jwellery' },
      { status: 500 }
    )
  }
}
