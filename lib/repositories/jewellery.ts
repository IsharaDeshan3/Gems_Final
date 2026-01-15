import { BaseRepository, BaseRepositoryImpl } from './base'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export interface Jewellery {
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
  is_month_highlight?: boolean
  created_at: string
  updated_at: string
}

export interface JewelleryFilters {
  minPrice?: number
  maxPrice?: number
  metal_type_purity?: string
  gemstone_type?: string
  isActive?: boolean
}

export interface JewelleryRepository extends BaseRepository<Jewellery> {
  searchJewellery(query: string, limit?: number): Promise<Jewellery[]>
  findActiveJewellery(limit?: number, offset?: number): Promise<Jewellery[]>
  findJewelleryWithFilters(filters: JewelleryFilters, limit?: number, offset?: number): Promise<Jewellery[]>

  /**
   * Marks a single jewellery item as the monthly highlight.
   * Implementations should ensure only one row remains highlighted.
   */
  setMonthHighlight(id: string, enabled: boolean): Promise<Jewellery | null>
}

export class JewelleryRepositoryImpl extends BaseRepositoryImpl<Jewellery> implements JewelleryRepository {
  private resolvedTable?: 'jewellery' | 'jwellery'

  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'jewellery')
  }

  private async getTableName(): Promise<'jewellery' | 'jwellery'> {
    if (this.resolvedTable) return this.resolvedTable

    // Prefer the correctly-spelled table, but fall back if only the legacy table exists.
    const probe = await this.supabase.from('jewellery').select('id').limit(1)
    if (!probe.error) {
      this.resolvedTable = 'jewellery'
      return this.resolvedTable
    }

    if ((probe.error as any)?.code === 'PGRST205') {
      this.resolvedTable = 'jwellery'
      return this.resolvedTable
    }

    throw probe.error
  }

  // Override base methods to use the resolved table name.
  async findById(id: string): Promise<Jewellery | null> {
    const table = await this.getTableName()
    const { data, error } = await this.supabase.from(table).select('*').eq('id', id).single()
    if (error) {
      if ((error as any).code === 'PGRST116') return null
      throw error
    }
    return data as Jewellery
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Jewellery[]> {
    const table = await this.getTableName()
    const { data, error } = await this.supabase.from(table).select('*').range(offset, offset + limit - 1)
    if (error) throw error
    return (data || []) as Jewellery[]
  }

  async create(data: any): Promise<Jewellery> {
    const table = await this.getTableName()
    const { data: result, error } = await (this.supabase as any).from(table).insert(data).select().single()
    if (error) throw error
    return result as Jewellery
  }

  async update(id: string, data: any): Promise<Jewellery | null> {
    const table = await this.getTableName()
    const { data: result, error } = await (this.supabase as any)
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if ((error as any).code === 'PGRST116') return null
      throw error
    }

    return result as Jewellery
  }

  async delete(id: string): Promise<boolean> {
    const table = await this.getTableName()
    const { error } = await this.supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return true
  }

  async count(): Promise<number> {
    const table = await this.getTableName()
    const { count, error } = await this.supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) throw error
    return count || 0
  }

  async searchJewellery(query: string, limit: number = 50): Promise<Jewellery[]> {
    const table = await this.getTableName()
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .or(
        `name.ilike.%${query}%,metal_type_purity.ilike.%${query}%,report_number.ilike.%${query}%`
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as Jewellery[]
  }

  async findActiveJewellery(limit: number = 50, offset: number = 0): Promise<Jewellery[]> {
    const table = await this.getTableName()
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return (data || []) as Jewellery[]
  }

  async findJewelleryWithFilters(filters: JewelleryFilters, limit: number = 50, offset: number = 0): Promise<Jewellery[]> {
    const table = await this.getTableName()
    let queryBuilder = this.supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.minPrice !== undefined) queryBuilder = queryBuilder.gte('price', filters.minPrice)
    if (filters.maxPrice !== undefined) queryBuilder = queryBuilder.lte('price', filters.maxPrice)
    if (filters.metal_type_purity) queryBuilder = queryBuilder.eq('metal_type_purity', filters.metal_type_purity)
    if (filters.gemstone_type) queryBuilder = queryBuilder.eq('gemstone_type', filters.gemstone_type)
    if (filters.isActive !== undefined) queryBuilder = queryBuilder.eq('is_active', filters.isActive)

    const { data, error } = await queryBuilder.range(offset, offset + limit - 1)
    if (error) throw error
    return (data || []) as Jewellery[]
  }

  async setMonthHighlight(id: string, enabled: boolean): Promise<Jewellery | null> {
    const table = await this.getTableName()

    if (enabled) {
      // Ensure only one highlighted row remains.
      const { error: clearError } = await (this.supabase as any)
        .from(table)
        .update({ is_month_highlight: false })
        .neq('id', id)

      if (clearError) throw clearError
    }

    return this.update(id, { is_month_highlight: enabled })
  }
}
