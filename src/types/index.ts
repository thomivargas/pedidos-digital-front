export type Rol = 'ADMIN' | 'VENDEDOR'

export type EstadoPedido = 'PENDIENTE' | 'ENVIADO_A_CAJA' | 'COMPLETADO'

export interface AuthUser {
  id: string
  nombre: string
  correo: string
  rol: Rol
}

export interface Pedido {
  id: string
  nombreProducto: string
  precio: string
  cotizacionDolar: string
  sku: string
  estado: EstadoPedido
  creadoEn: string
  actualizadoEn: string
  vendedorId: string
  vendedor?: {
    id: string
    nombre: string
    correo: string
  }
}

export interface Sucursal {
  id: string
  nombre: string
  direccion: string | null
  creadoEn: string
  actualizadoEn: string
  _count: { vendedores: number }
  vendedores: { id: string }[]
}

export interface VendedorConConteo {
  id: string
  nombre: string
  correo: string
  rol: Rol
  creadoEn: string
  sucursalId: string | null
  sucursal: { id: string; nombre: string } | null
  _count: { pedidos: number }
}

export interface PaginatedMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  status: string
  data: T[]
  meta: PaginatedMeta
}

export interface LoginResponse {
  status: string
  accessToken: string
  refreshToken: string
  user: AuthUser
}
