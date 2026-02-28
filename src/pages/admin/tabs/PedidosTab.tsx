import { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

import { EstadoBadge } from '@/components/shared/EstadoBadge'
import { PaginacionControls } from '@/components/shared/PaginacionControls'
import type { EstadoPedido } from '@/types'

import { useCompletarPedido, useListarPedidos } from '../hooks/usePedidos'
import { useListarVendedores } from '../hooks/useVendedores'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const LIMIT = 8
const ALL = 'all'

export function PedidosTab() {
  const [page, setPage] = useState(1)
  const [estado, setEstado] = useState<EstadoPedido | typeof ALL>(ALL)
  const [vendedorId, setVendedorId] = useState(ALL)

  const { data: pedidosData, isLoading: loadingPedidos } = useListarPedidos({
    page,
    limit: LIMIT,
    estado: estado === ALL ? undefined : estado,
    vendedorId: vendedorId === ALL ? undefined : vendedorId,
  })

  const { data: vendedoresData } = useListarVendedores(1, 100) 
  
  const { mutate: completar, isPending: completando } = useCompletarPedido()

  const pedidos = pedidosData?.data ?? []
  const meta = pedidosData?.meta
  const vendedores = vendedoresData?.data ?? []

  const tienesFiltros = estado !== ALL || vendedorId !== ALL

  const limpiarFiltros = () => {
    setEstado(ALL)
    setVendedorId(ALL)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={estado}
          onValueChange={(v) => {
            setEstado(v as EstadoPedido | typeof ALL)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="ENVIADO_A_CAJA">En caja</SelectItem>
            <SelectItem value="COMPLETADO">Completado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={vendedorId}
          onValueChange={(v) => {
            setVendedorId(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los vendedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los vendedores</SelectItem>
            {vendedores.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {tienesFiltros && (
          <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        )}

        {meta && (
          <span className="ml-auto text-sm text-muted-foreground">
            {meta.total} {meta.total === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-60 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Producto
              </TableHead>
              <TableHead className="w-32 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                SKU
              </TableHead>
              <TableHead className="w-40 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Vendedor
              </TableHead>
              <TableHead className="w-32 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Precio (USD)
              </TableHead>
              <TableHead className="w-32 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Cotización
              </TableHead>
              <TableHead className="w-32 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Pago
              </TableHead>
              <TableHead className="w-32 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Estado
              </TableHead>
              <TableHead className="w-36 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Fecha
              </TableHead>
              <TableHead className="w-24 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingPedidos ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/50">
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={j} className="py-4 px-5">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pedidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-20 text-center text-muted-foreground text-sm">
                  No se encontraron pedidos
                </TableCell>
              </TableRow>
            ) : (
              pedidos.map((p, index) => (
                <TableRow
                  key={p.id}
                  className={`hover:bg-table-row-hover transition-colors duration-150 ${
                    index !== pedidos.length - 1 ? "border-b border-border/50" : "border-0"
                  }`}
                >
                  <TableCell className="p-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground" title={p.nombreProducto}>
                        {p.nombreProducto}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="p-3.5">
                    <span className="text-sm text-muted-foreground tabular-nums">{p.sku}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    {p.vendedor?.nombre ? (
                      <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium">
                        {p.vendedor.nombre}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell className="p-3.5">
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      ${Number(p.precio).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell className="p-3.5">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      ${Number(p.cotizacionDolar).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell className="p-3.5">
                    <div className="text-xs">
                      {p.metodoPago === 'TARJETA' && p.planPago
                        ? `${p.planPago.marca} ${p.planPago.cuotas}c`
                        : p.metodoPago === 'TRANSFERENCIA'
                          ? 'Transf.'
                          : 'Efectivo'}
                    </div>
                    {p.permutaModelo && (
                      <div className="text-xs text-muted-foreground">
                        + {p.permutaModelo} (${Number(p.permutaValorUsd ?? 0).toFixed(0)})
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-3.5">
                    <EstadoBadge estado={p.estado} />
                  </TableCell>
                  <TableCell className="p-3.5 text-xs text-muted-foreground">
                    {new Date(p.creadoEn).toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell className="p-3.5">
                    {p.estado === "ENVIADO_A_CAJA" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2.5 text-xs gap-1"
                        disabled={completando}
                        onClick={() => completar(p.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {meta && (
          <div className="px-6 pb-4">
            <PaginacionControls meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}