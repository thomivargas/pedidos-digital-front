import { apiClient } from './client'
import type { Pedido, PaginatedResponse, MetodoPago } from '@/types'

export interface CrearPedidoDto {
  nombreProducto: string
  precio: number
  cotizacionDolar: number
  sku: string
  observacion?: string
  metodoPago: MetodoPago
  planPagoId?: string
  permutaModelo?: string
  permutaBateria?: number
  permutaValorUsd?: number
}

interface ListarPedidosResponse extends PaginatedResponse<Pedido> {}

interface EnviarACajaResponse {
  status: string
  data: Pedido
}

export const pedidosApi = {
  crear: async (dto: CrearPedidoDto) => {
    const { data } = await apiClient.post<{ status: string; data: Pedido }>('/pedidos', dto)
    return data.data
  },

  listar: async (page = 1, limit = 20): Promise<ListarPedidosResponse> => {
    const { data } = await apiClient.get<ListarPedidosResponse>('/pedidos', {
      params: { page, limit },
    })
    return data
  },

  enviarACaja: async (id: string): Promise<EnviarACajaResponse> => {
    const { data } = await apiClient.patch<EnviarACajaResponse>(`/pedidos/${id}/enviar-caja`)
    return data
  },
}
