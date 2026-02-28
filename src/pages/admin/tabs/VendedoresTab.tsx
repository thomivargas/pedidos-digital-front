import { useState } from 'react'
import { Plus, X, MapPin } from 'lucide-react'
import { useListarVendedores } from '../hooks/useVendedores'
import { useListarSucursales } from '../hooks/useSucursales'

import { PaginacionControls } from '@/components/shared/PaginacionControls'
import { NuevoUsuarioModal } from '../NuevoUsuarioModal'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const LIMIT = 10
const ALL = 'all'
const NONE = 'none'

export function VendedoresTab() {
  const [page, setPage] = useState(1)
  const [sucursalFiltro, setSucursalFiltro] = useState(ALL)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useListarVendedores(
    page,
    LIMIT,
    sucursalFiltro === ALL ? undefined : sucursalFiltro
  )

  const { data: sucursalesData } = useListarSucursales(1, 100)

  const vendedores = data?.data ?? []
  const meta = data?.meta
  const sucursales = sucursalesData?.data ?? []
  const mostrarFiltroSucursal = sucursales.length > 1

  const initials = (nombre: string) =>
    nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {mostrarFiltroSucursal && (
          <Select
            value={sucursalFiltro}
            onValueChange={(v) => { setSucursalFiltro(v); setPage(1) }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Todas las sucursales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas las sucursales</SelectItem>
              <SelectItem value={NONE}>Sin sucursal</SelectItem>
              {sucursales.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {sucursalFiltro !== ALL && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSucursalFiltro(ALL); setPage(1) }}
            className="gap-1.5 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}

        <div className="ml-auto flex items-center gap-3">
          {meta && (
            <span className="text-sm text-muted-foreground">
              {meta.total} {meta.total === 1 ? 'usuario' : 'usuarios'}
            </span>
          )}
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-52 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Usuario
              </TableHead>
              <TableHead className="w-32 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Rol
              </TableHead>
              <TableHead className="w-40 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Sucursal
              </TableHead>
              <TableHead className="text-right w-24 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Pedidos
              </TableHead>
              <TableHead className="text-right w-28 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Registrado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/50">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j} className="py-4 px-5">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : vendedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-muted-foreground text-sm">
                  {sucursalFiltro !== ALL
                    ? 'No hay usuarios en esta sucursal'
                    : 'No hay usuarios registrados'}
                </TableCell>
              </TableRow>
            ) : (
              vendedores.map((v, index) => (
                <TableRow 
                  key={v.id} 
                  className={`hover:bg-table-row-hover transition-colors duration-150 ${
                    index !== vendedores.length - 1 ? "border-b border-border/50" : "border-0"
                  }`}
                >
                  <TableCell className="p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {initials(v.nombre)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-none">{v.nombre}</p>
                        <p className="truncate text-xs text-muted-foreground mt-0.5">{v.correo}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3.5">
                    <Badge
                      variant="outline"
                      className={
                        v.rol === 'ADMIN'
                          ? 'border-purple-200 bg-purple-50 text-purple-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }
                    >
                      {v.rol === 'ADMIN' ? 'Admin' : 'Vendedor'}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-3.5">
                    {v.sucursal ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{v.sucursal.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin sucursal</span>
                    )}
                  </TableCell>
                  <TableCell className="p-3.5 text-right">
                    <span className="text-sm font-semibold tabular-nums">{v._count.pedidos}</span>
                  </TableCell>
                  <TableCell className="p-3.5 text-right text-xs text-muted-foreground">
                    {new Date(v.creadoEn).toLocaleDateString('es-AR')}
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

      <NuevoUsuarioModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}