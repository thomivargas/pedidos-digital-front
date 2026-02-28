export type Rol = 'ADMIN' | 'VENDEDOR'

export type EstadoPedido = 'PENDIENTE' | 'ENVIADO_A_CAJA' | 'COMPLETADO'

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'

export interface AuthUser {
  id: string
  nombre: string
  correo: string
  rol: Rol
}

export interface PlanPago {
  id: string
  marca: string
  cuotas: number
  interesPct: string
  ivaPct: string
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface CelularPermuta {
  id: string
  nombre: string
  modelo: string
  bateriaMin: number
  bateriaMax: number
  precioUsd: string
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface Pedido {
  id: string
  nombreProducto: string
  precio: string
  cotizacionDolar: string
  sku: string
  estado: EstadoPedido
  observacion: string | null
  metodoPago: MetodoPago
  planPagoId: string | null
  planPago: PlanPago | null
  permutaModelo: string | null
  permutaBateria: number | null
  permutaValorUsd: string | null
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
