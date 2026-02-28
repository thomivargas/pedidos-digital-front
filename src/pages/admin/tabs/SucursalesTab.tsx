import { useState } from 'react'
import { Plus, MapPin, UserCog } from 'lucide-react'
import { useListarSucursales } from '../hooks/useSucursales'

import { PaginacionControls } from '@/components/shared/PaginacionControls'
import { NuevaSucursalModal } from '../NuevaSucursalModal'
import { AsignarVendedoresModal } from '../AsignarVendedoresModal'
import type { Sucursal } from '@/types'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const LIMIT = 8

export function SucursalesTab() {
  const [page, setPage] = useState(1)
  const [modalCrear, setModalCrear] = useState(false)
  const [sucursalAsignar, setSucursalAsignar] = useState<Sucursal | null>(null)

  const { data, isLoading } = useListarSucursales(page, LIMIT)

  const sucursales = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta ? `${meta.total} ${meta.total === 1 ? 'sucursal' : 'sucursales'} registradas` : ''}
        </p>
        <Button onClick={() => setModalCrear(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva sucursal
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Nombre
              </TableHead>
              <TableHead className="hidden sm:table-cell text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Dirección
              </TableHead>
              <TableHead className="w-px whitespace-nowrap text-right text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Vendedores
              </TableHead>
              <TableHead className="hidden w-px whitespace-nowrap sm:table-cell text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Creada
              </TableHead>
              <TableHead className="w-px whitespace-nowrap text-right text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/50">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j} className="py-4 px-5">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sucursales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-muted-foreground text-sm">
                  No hay sucursales registradas
                </TableCell>
              </TableRow>
            ) : (
              sucursales.map((s, index) => (
                <TableRow 
                  key={s.id}
                  className={`hover:bg-table-row-hover transition-colors duration-150 ${
                    index !== sucursales.length - 1 ? "border-b border-border/50" : "border-0"
                  }`}
                >
                  <TableCell className="p-3.5 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {s.nombre}
                    </div>
                  </TableCell>
                  <TableCell className="hidden p-3.5 text-sm text-muted-foreground sm:table-cell">
                    {s.direccion ?? <span className="italic">Sin dirección</span>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-3.5 text-right">
                    <Badge variant="secondary">{s._count.vendedores}</Badge>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap p-3.5 text-xs text-muted-foreground sm:table-cell">
                    {new Date(s.creadoEn).toLocaleDateString('es-AR')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => setSucursalAsignar(s)}
                    >
                      <UserCog className="h-3.5 w-3.5" />
                      Asignar
                    </Button>
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

      <NuevaSucursalModal open={modalCrear} onOpenChange={setModalCrear} />
      {sucursalAsignar && (
        <AsignarVendedoresModal
          sucursal={sucursalAsignar}
          open={!!sucursalAsignar}
          onOpenChange={(val) => { if (!val) setSucursalAsignar(null) }}
        />
      )}
    </div>
  )
}