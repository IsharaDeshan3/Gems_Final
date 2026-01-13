import { BaseRepository, BaseRepositoryImpl } from './base'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export interface Jwellery {
  id: string
  name: string
  price: number

  metal_type_purity?: string
  gross_weight_grams?: number
  gemstone_type?: string
  carat_weight?: number
  cut_and_shape?: string
  color_and_clarity?: string
  report_number?: string
  report_date?: string
  authorized_seal_signature?: string

  images?: string[]
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface JwelleryFilters {
  minPrice?: number
  maxPrice?: number
  metal_type_purity?: string
  gemstone_type?: string
  isActive?: boolean
}

export interface JwelleryRepository extends BaseRepository<Jwellery> {
  searchJwellery(query: string, limit?: number): Promise<Jwellery[]>
  findActiveJwellery(limit?: number, offset?: number): Promise<Jwellery[]>
  findJwelleryWithFilters(filters: JwelleryFilters, limit?: number, offset?: number): Promise<Jwellery[]>
}

export class JwelleryRepositoryImpl extends BaseRepositoryImpl<Jwellery> implements JwelleryRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'jwellery')
  }

  async searchJwellery(query: string, limit: number = 50): Promise<Jwellery[]> {
    const { data, error } = await this.supabase
      .from('jwellery')
      .select('*')
      .or(
        `name.ilike.%${query}%,metal_type_purity.ilike.%${query}%,report_number.ilike.%${query}%`
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as Jwellery[]
  }

  async findActiveJwellery(limit: number = 50, offset: number = 0): Promise<Jwellery[]> {
    const { data, error } = await this.supabase
      .from('jwellery')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return (data || []) as Jwellery[]
  }

  async findJwelleryWithFilters(filters: JwelleryFilters, limit: number = 50, offset: number = 0): Promise<Jwellery[]> {
    let queryBuilder = this.supabase
      .from('jwellery')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.minPrice !== undefined) queryBuilder = queryBuilder.gte('price', filters.minPrice)
    if (filters.maxPrice !== undefined) queryBuilder = queryBuilder.lte('price', filters.maxPrice)
    if (filters.metal_type_purity) queryBuilder = queryBuilder.eq('metal_type_purity', filters.metal_type_purity)
    if (filters.gemstone_type) queryBuilder = queryBuilder.eq('gemstone_type', filters.gemstone_type)
    if (filters.isActive !== undefined) queryBuilder = queryBuilder.eq('is_active', filters.isActive)

    const { data, error } = await queryBuilder.range(offset, offset + limit - 1)
    if (error) throw error
    return (data || []) as Jwellery[]
  }
}
