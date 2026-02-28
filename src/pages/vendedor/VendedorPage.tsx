import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { pedidosApi } from '@/api/pedidos'
import { useAuth } from '@/contexts/AuthContext'
import { EstadoBadge } from '@/components/shared/EstadoBadge'
import { PaginacionControls } from '@/components/shared/PaginacionControls'
import { NuevoPedidoModal } from './NuevoPedidoModal'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, SendHorizontal, ClipboardList, PackageCheck } from 'lucide-react'

const LIMIT = 10

export function VendedorPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['mis-pedidos', page],
    queryFn: () => pedidosApi.listar(page, LIMIT),
  })

  const { mutate: enviarACaja, isPending: enviando } = useMutation({
    mutationFn: pedidosApi.enviarACaja,
    onSuccess: () => {
      toast.success('Pedido enviado a caja')
      void queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] })
    },
    onError: () => toast.error('No se pudo enviar a caja'),
  })

  const pedidos = data?.data ?? []
  const meta = data?.meta

  const totalPendientes = pedidos.filter((p) => p.estado === 'PENDIENTE').length
  const totalCompletados = pedidos.filter((p) => p.estado === 'COMPLETADO').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight py-4">
            Hola, {user?.nombre.split(' ')[0]}
          </h1>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 sm:self-start">
          <Plus className="h-4 w-4" />
          Nuevo pedido
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Total pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{meta?.total ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <SendHorizontal className="h-4 w-4 text-amber-500" />
              Pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{isLoading ? '—' : totalPendientes}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <PackageCheck className="h-4 w-4 text-green-500" />
              Completados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{isLoading ? '—' : totalCompletados}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table - Estilo unificado */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Producto
              </TableHead>
              <TableHead className="hidden w-32 whitespace-nowrap sm:table-cell text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                SKU
              </TableHead>
              <TableHead className="hidden w-32 whitespace-nowrap text-right md:table-cell text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Precio (USD)
              </TableHead>
              <TableHead className="hidden w-32 whitespace-nowrap text-right lg:table-cell text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Cotización
              </TableHead>
              <TableHead className="w-32 whitespace-nowrap text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Estado
              </TableHead>
              <TableHead className="hidden w-32 whitespace-nowrap sm:table-cell text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Fecha
              </TableHead>
              <TableHead className="w-32 whitespace-nowrap text-right text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j} className="py-4 px-5">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pedidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center text-muted-foreground text-sm">
                  No tenés pedidos todavía. ¡Creá tu primero!
                </TableCell>
              </TableRow>
            ) : (
              pedidos.map((pedido, index) => (
                <TableRow
                  key={pedido.id}
                  className={`hover:bg-table-row-hover transition-colors duration-150 ${
                    index !== pedidos.length - 1 ? "border-b border-border/50" : "border-0"
                  }`}
                >
                  <TableCell className="p-3.5 font-medium">
                    <div className="max-w-55 truncate" title={pedido.nombreProducto}>
                      {pedido.nombreProducto}
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap p-3.5 font-mono text-xs text-muted-foreground sm:table-cell">
                    {pedido.sku}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap p-3.5 text-right tabular-nums md:table-cell">
                    ${Number(pedido.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap p-3.5 text-right tabular-nums lg:table-cell">
                    ${Number(pedido.cotizacionDolar).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-3.5">
                    <EstadoBadge estado={pedido.estado} />
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap p-3.5 text-xs text-muted-foreground sm:table-cell">
                    {new Date(pedido.creadoEn).toLocaleDateString('es-AR')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-3.5 text-right">
                    {pedido.estado === 'PENDIENTE' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        disabled={enviando}
                        onClick={() => enviarACaja(pedido.id)}
                      >
                        <div className='flex items-center gap-1'>
                          <span>Enviar a caja</span>
                          <SendHorizontal className="h-3.5 w-3.5 mt-0.5" />
                        </div>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1.5 text-xs"
                        disabled
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        Enviado
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

      <NuevoPedidoModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}