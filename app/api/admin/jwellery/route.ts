import { NextRequest, NextResponse } from 'next/server'
import { enforceCsrf, getAuthenticatedUser, isAdminRole, isHighAdminRole } from '@/lib/auth/middleware-helper'
import { getRepositoryFactory } from '@/lib/repositories'
import { rateLimiters, getRateLimitIdentifier } from '@/lib/rate-limit'
import { validateInput, ValidationRule } from '@/lib/validation'

// GET /api/admin/jwellery - Get all jwellery items
export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error } = await getAuthenticatedUser(request)
    if (error || !user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || 'Forbidden - Admin access required' },
        { status: error ? 401 : 403 }
      )
    }

    const jwelleryRepository = getRepositoryFactory(supabase).getJwelleryRepository()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let items
    if (search) {
      items = await jwelleryRepository.searchJwellery(search, limit)
    } else if (minPrice || maxPrice || isActive !== undefined) {
      items = await jwelleryRepository.findJwelleryWithFilters(
        {
          minPrice,
          maxPrice,
          isActive
        },
        limit,
        offset
      )
    } else {
      items = await jwelleryRepository.findAll(limit, offset)
    }

    return NextResponse.json({ jwellery: items }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching jwellery:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jwellery' },
      { status: 500 }
    )
  }
}

// POST /api/admin/jwellery - Create a new jwellery item
export async function POST(request: NextRequest) {
  try {
    const clientId = getRateLimitIdentifier(request)
    const rateLimit = await rateLimiters.api(clientId)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { user, supabase, error } = await getAuthenticatedUser(request)
    if (error || !user || !isHighAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || 'Forbidden - Admin access required' },
        { status: error ? 401 : 403 }
      )
    }

    const csrf = enforceCsrf(request)
    if (!csrf.ok) {
      return NextResponse.json({ error: csrf.error }, { status: 403 })
    }

    const jwelleryRepository = getRepositoryFactory(supabase).getJwelleryRepository()
    const auditLogRepository = getRepositoryFactory(supabase).getAuditLogRepository()

    const body = await request.json()

    const rules: ValidationRule[] = [
      { field: 'name', type: 'string', required: true },
      { field: 'price', type: 'number', required: true, min: 0, max: 10000000 },
      { field: 'metal_type_purity', type: 'string', required: false },
      { field: 'gross_weight_grams', type: 'number', required: false, min: 0, max: 100000 },
      { field: 'gemstone_type', type: 'string', required: false },
      { field: 'carat_weight', type: 'number', required: false, min: 0, max: 100000 },
      { field: 'cut_and_shape', type: 'string', required: false },
      { field: 'color_and_clarity', type: 'string', required: false },
      { field: 'report_number', type: 'string', required: false },
      { field: 'report_date', type: 'string', required: false },
      { field: 'authorized_seal_signature', type: 'string', required: false },
      { field: 'stock_quantity', type: 'number', required: false, min: 0, max: 100000 }
    ]

    const validation = validateInput(body, rules)
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Validation failed: ${validation.errors.map((e) => e.message).join(', ')}` },
        { status: 400 }
      )
    }

    const newItem = await jwelleryRepository.create({
      name: body.name,
      price: body.price,
      metal_type_purity: body.metal_type_purity,
      gross_weight_grams: body.gross_weight_grams,
      gemstone_type: body.gemstone_type,
      carat_weight: body.carat_weight,
      cut_and_shape: body.cut_and_shape,
      color_and_clarity: body.color_and_clarity,
      report_number: body.report_number,
      report_date: body.report_date,
      authorized_seal_signature: body.authorized_seal_signature,
      images: body.images || [],
      stock_quantity: body.stock_quantity || 0,
      is_active: body.is_active !== undefined ? body.is_active : true
    })

    await auditLogRepository.create({
      user_id: user.id,
      action: 'CREATE_JWELLERY',
      entity_type: 'jwellery',
      entity_id: newItem.id,
      changes: {
        name: newItem.name,
        price: newItem.price,
        metal_type_purity: newItem.metal_type_purity
      }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error: any) {
    console.error('Error creating jwellery:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create jwellery' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/jwellery - Update a jwellery item
export async function PUT(request: NextRequest) {
  try {
    const { user, supabase, error } = await getAuthenticatedUser(request)
    if (error || !user || !isHighAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || 'Forbidden - Admin access required' },
        { status: error ? 401 : 403 }
      )
    }

    const csrf = enforceCsrf(request)
    if (!csrf.ok) {
      return NextResponse.json({ error: csrf.error }, { status: 403 })
    }

    const jwelleryRepository = getRepositoryFactory(supabase).getJwelleryRepository()
    const auditLogRepository = getRepositoryFactory(supabase).getAuditLogRepository()

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Jwellery ID is required' }, { status: 400 })
    }

    const existing = await jwelleryRepository.findById(body.id)
    if (!existing) {
      return NextResponse.json({ error: 'Jwellery item not found' }, { status: 404 })
    }

    const allowedFields = [
      'name',
      'price',
      'metal_type_purity',
      'gross_weight_grams',
      'gemstone_type',
      'carat_weight',
      'cut_and_shape',
      'color_and_clarity',
      'report_number',
      'report_date',
      'authorized_seal_signature',
      'images',
      'stock_quantity',
      'is_active'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field]
    }

    const updated = await jwelleryRepository.update(body.id, updateData)
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update jwellery' }, { status: 500 })
    }

    await auditLogRepository.create({
      user_id: user.id,
      action: 'UPDATE_JWELLERY',
      entity_type: 'jwellery',
      entity_id: updated.id,
      changes: {
        name: updated.name,
        updatedFields: Object.keys(updateData)
      }
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    console.error('Error updating jwellery:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update jwellery' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/jwellery - Delete a jwellery item
export async function DELETE(request: NextRequest) {
  try {
    const { user, supabase, error } = await getAuthenticatedUser(request)
    if (error || !user || !isHighAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || 'Forbidden - Admin access required' },
        { status: error ? 401 : 403 }
      )
    }

    const csrf = enforceCsrf(request)
    if (!csrf.ok) {
      return NextResponse.json({ error: csrf.error }, { status: 403 })
    }

    const jwelleryRepository = getRepositoryFactory(supabase).getJwelleryRepository()
    const auditLogRepository = getRepositoryFactory(supabase).getAuditLogRepository()

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Jwellery ID is required' }, { status: 400 })
    }

    const existing = await jwelleryRepository.findById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Jwellery item not found' }, { status: 404 })
    }

    const deleted = await jwelleryRepository.delete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete jwellery' }, { status: 500 })
    }

    await auditLogRepository.create({
      user_id: user.id,
      action: 'DELETE_JWELLERY',
      entity_type: 'jwellery',
      entity_id: id,
      changes: {
        name: existing.name
      }
    })

    return NextResponse.json({ message: 'Jwellery deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting jwellery:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete jwellery' },
      { status: 500 }
    )
  }
}
