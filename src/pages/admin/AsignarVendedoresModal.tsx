import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Search } from 'lucide-react'

import { adminApi } from '@/api/admin'
import type { Sucursal } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  sucursal: Sucursal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AsignarVendedoresModal({ sucursal, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [seleccionados, setSeleccionados] = useState<Set<string>>(
    () => new Set(sucursal.vendedores.map((v) => v.id)),
  )

  // Reinicializar selección cuando cambia la sucursal
  const currentIds = sucursal.vendedores.map((v) => v.id).join(',')
  const [prevIds, setPrevIds] = useState(currentIds)
  if (currentIds !== prevIds) {
    setSeleccionados(new Set(sucursal.vendedores.map((v) => v.id)))
    setPrevIds(currentIds)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['vendedores', 1],
    queryFn: () => adminApi.vendedores.listar(1, 100),
    enabled: open,
  })

  const vendedores = (data?.data ?? []).filter((v) =>
    v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.correo.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      adminApi.sucursales.asignarVendedores(sucursal.id, Array.from(seleccionados)),
    onSuccess: () => {
      toast.success('Vendedores asignados correctamente')
      void queryClient.invalidateQueries({ queryKey: ['sucursales'] })
      void queryClient.invalidateQueries({ queryKey: ['vendedores'] })
      onOpenChange(false)
    },
    onError: () => toast.error('Error al asignar vendedores'),
  })

  const toggle = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) setBusqueda('')
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar vendedores</DialogTitle>
          <DialogDescription>
            Seleccioná los vendedores que pertenecen a{' '}
            <span className="font-medium text-foreground">{sucursal.nombre}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar vendedor..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Lista */}
        <ScrollArea className="h-64 rounded-md border">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : vendedores.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No se encontraron vendedores
            </p>
          ) : (
            <div className="p-2">
              {vendedores.map((v) => (
                <label
                  key={v.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted/60 transition-colors"
                >
                  <Checkbox
                    checked={seleccionados.has(v.id)}
                    onCheckedChange={() => toggle(v.id)}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{v.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">{v.correo}</p>
                  </div>
                  {v.sucursalId && v.sucursalId !== sucursal.id && (
                    <span className="ml-auto shrink-0 text-xs text-amber-600">
                      {v.sucursal?.nombre}
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </ScrollArea>

        <p className="text-xs text-muted-foreground">
          {seleccionados.size} vendedor{seleccionados.size !== 1 ? 'es' : ''} seleccionado{seleccionados.size !== 1 ? 's' : ''}
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => mutate()} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
