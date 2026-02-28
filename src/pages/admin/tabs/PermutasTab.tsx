import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

import { PaginacionControls } from '@/components/shared/PaginacionControls'
import { useListarPermutas, useCrearPermuta, useEditarPermuta, useDesactivarPermuta } from '../hooks/usePermutas'
import type { CelularPermuta } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const LIMIT = 8

const permutaFormSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  modelo: z.string().min(1, 'Modelo requerido'),
  bateriaMin: z.number().int().min(0).max(100),
  bateriaMax: z.number().int().min(0).max(100),
  precioUsd: z.number().positive('El precio debe ser mayor a 0'),
})

type PermutaFormValues = z.infer<typeof permutaFormSchema>

export function PermutasTab() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<CelularPermuta | null>(null)

  const { data, isLoading } = useListarPermutas(page, LIMIT)
  const { mutate: crear, isPending: creando } = useCrearPermuta()
  const { mutate: editar, isPending: editandoPending } = useEditarPermuta()
  const { mutate: desactivar, isPending: desactivando } = useDesactivarPermuta()

  const permutas = data?.data ?? []
  const meta = data?.meta

  const form = useForm<PermutaFormValues>({
    resolver: zodResolver(permutaFormSchema),
    defaultValues: { nombre: '', modelo: '', bateriaMin: 0, bateriaMax: 100, precioUsd: 0 },
  })

  const abrirCrear = () => {
    setEditando(null)
    form.reset({ nombre: '', modelo: '', bateriaMin: 0, bateriaMax: 100, precioUsd: 0 })
    setModalOpen(true)
  }

  const abrirEditar = (p: CelularPermuta) => {
    setEditando(p)
    form.reset({
      nombre: p.nombre,
      modelo: p.modelo,
      bateriaMin: p.bateriaMin,
      bateriaMax: p.bateriaMax,
      precioUsd: Number(p.precioUsd),
    })
    setModalOpen(true)
  }

  const onSubmit = (values: PermutaFormValues) => {
    if (editando) {
      editar(
        { id: editando.id, dto: values },
        { onSuccess: () => { setModalOpen(false); setEditando(null) } },
      )
    } else {
      crear(values, { onSuccess: () => setModalOpen(false) })
    }
  }

  const isPending = creando || editandoPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {meta ? `${meta.total} ${meta.total === 1 ? 'permuta' : 'permutas'}` : ''}
        </span>
        <Button onClick={abrirCrear} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva permuta
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Modelo
              </TableHead>
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Código
              </TableHead>
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Batería
              </TableHead>
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Precio USD
              </TableHead>
              <TableHead className="w-28 text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Acciones
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
            ) : permutas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-muted-foreground text-sm">
                  No hay permutas en el catálogo
                </TableCell>
              </TableRow>
            ) : (
              permutas.map((p, index) => (
                <TableRow
                  key={p.id}
                  className={`hover:bg-table-row-hover transition-colors duration-150 ${
                    index !== permutas.length - 1 ? 'border-b border-border/50' : 'border-0'
                  }`}
                >
                  <TableCell className="p-3.5 font-medium">{p.nombre}</TableCell>
                  <TableCell className="p-3.5 text-sm text-muted-foreground font-mono">
                    {p.modelo}
                  </TableCell>
                  <TableCell className="p-3.5 text-sm tabular-nums">
                    {p.bateriaMin}% - {p.bateriaMax}%
                  </TableCell>
                  <TableCell className="p-3.5 text-sm font-semibold tabular-nums">
                    ${Number(p.precioUsd).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="p-3.5">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => abrirEditar(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        disabled={desactivando}
                        onClick={() => desactivar(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {/* Modal Crear/Editar */}
      <Dialog open={modalOpen} onOpenChange={(v) => { setModalOpen(v); if (!v) setEditando(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar permuta' : 'Nueva permuta'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: iPhone 13" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: A2633" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bateriaMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batería mín (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bateriaMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batería máx (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="precioUsd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value === '' ? NaN : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editando ? 'Guardar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
