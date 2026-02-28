import { apiClient } from './client'
import type { PlanPago, PaginatedResponse } from '@/types'

export const planesPagoApi = {
  listar: async (page = 1, limit = 100): Promise<PaginatedResponse<PlanPago>> => {
    const { data } = await apiClient.get<PaginatedResponse<PlanPago>>('/planes-pago', {
      params: { page, limit },
    })
    return data
  },
}

export interface CrearPlanPagoDto {
  marca: string
  cuotas: number
  interesPct: number
  ivaPct: number
}

export const adminPlanesPagoApi = {
  listar: async (page = 1, limit = 20): Promise<PaginatedResponse<PlanPago>> => {
    const { data } = await apiClient.get<PaginatedResponse<PlanPago>>('/admin/planes-pago', {
      params: { page, limit },
    })
    return data
  },

  crear: async (dto: CrearPlanPagoDto): Promise<PlanPago> => {
    const { data } = await apiClient.post<{ status: string; data: PlanPago }>(
      '/admin/planes-pago',
      dto,
    )
    return data.data
  },

  editar: async (id: string, dto: Partial<CrearPlanPagoDto>): Promise<PlanPago> => {
    const { data } = await apiClient.patch<{ status: string; data: PlanPago }>(
      `/admin/planes-pago/${id}`,
      dto,
    )
    return data.data
  },

  desactivar: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/planes-pago/${id}`)
  },
}
