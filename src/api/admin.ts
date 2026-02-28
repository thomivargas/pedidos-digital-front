import { apiClient } from './client'
import type { Pedido, VendedorConConteo, Sucursal, PaginatedResponse, EstadoPedido, Rol } from '@/types'

export interface CrearUsuarioDto {
  nombre: string
  correo: string
  contrasena: string
  rol: Rol
}

export const adminApi = {
  pedidos: {
    listar: async (params: {
      page?: number
      limit?: number
      estado?: EstadoPedido | ''
      vendedorId?: string
    }): Promise<PaginatedResponse<Pedido>> => {
      const query = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(params.estado ? { estado: params.estado } : {}),
        ...(params.vendedorId ? { vendedorId: params.vendedorId } : {}),
      }
      const { data } = await apiClient.get<PaginatedResponse<Pedido>>('/admin/pedidos', {
        params: query,
      })
      return data
    },

    completar: async (id: string): Promise<Pedido> => {
      const { data } = await apiClient.patch<{ status: string; data: Pedido }>(
        `/admin/pedidos/${id}/completar`,
      )
      return data.data
    },
  },

  vendedores: {
    listar: async (
      page = 1,
      limit = 20,
      sucursalId?: string,
    ): Promise<PaginatedResponse<VendedorConConteo>> => {
      const { data } = await apiClient.get<PaginatedResponse<VendedorConConteo>>(
        '/admin/vendedores',
        { params: { page, limit, ...(sucursalId ? { sucursalId } : {}) } },
      )
      return data
    },

    crear: async (dto: CrearUsuarioDto): Promise<void> => {
      await apiClient.post('/admin/usuarios', dto)
    },
  },

  sucursales: {
    listar: async (page = 1, limit = 20): Promise<PaginatedResponse<Sucursal>> => {
      const { data } = await apiClient.get<PaginatedResponse<Sucursal>>('/admin/sucursales', {
        params: { page, limit },
      })
      return data
    },

    crear: async (dto: { nombre: string; direccion?: string }): Promise<Sucursal> => {
      const { data } = await apiClient.post<{ status: string; data: Sucursal }>(
        '/admin/sucursales',
        dto,
      )
      return data.data
    },

    asignarVendedores: async (sucursalId: string, vendedorIds: string[]): Promise<Sucursal> => {
      const { data } = await apiClient.patch<{ status: string; data: Sucursal }>(
        `/admin/sucursales/${sucursalId}/vendedores`,
        { vendedorIds },
      )
      return data.data
    },
  },
}
