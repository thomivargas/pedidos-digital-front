import { apiClient } from './client'
import type { CelularPermuta, PaginatedResponse } from '@/types'

export const permutasApi = {
  listar: async (page = 1, limit = 100): Promise<PaginatedResponse<CelularPermuta>> => {
    const { data } = await apiClient.get<PaginatedResponse<CelularPermuta>>('/permutas', {
      params: { page, limit },
    })
    return data
  },
}

export interface CrearPermutaDto {
  nombre: string
  modelo: string
  bateriaMin: number
  bateriaMax: number
  precioUsd: number
}

export const adminPermutasApi = {
  listar: async (page = 1, limit = 20): Promise<PaginatedResponse<CelularPermuta>> => {
    const { data } = await apiClient.get<PaginatedResponse<CelularPermuta>>('/admin/permutas', {
      params: { page, limit },
    })
    return data
  },

  crear: async (dto: CrearPermutaDto): Promise<CelularPermuta> => {
    const { data } = await apiClient.post<{ status: string; data: CelularPermuta }>(
      '/admin/permutas',
      dto,
    )
    return data.data
  },

  editar: async (id: string, dto: Partial<CrearPermutaDto>): Promise<CelularPermuta> => {
    const { data } = await apiClient.patch<{ status: string; data: CelularPermuta }>(
      `/admin/permutas/${id}`,
      dto,
    )
    return data.data
  },

  desactivar: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/permutas/${id}`)
  },
}
