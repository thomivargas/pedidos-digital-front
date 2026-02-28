import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

import { PaginacionControls } from '@/components/shared/PaginacionControls'
import { useListarPlanesPago, useCrearPlanPago, useEditarPlanPago, useDesactivarPlanPago } from '../hooks/usePlanesPago'
import type { PlanPago } from '@/types'

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

const planFormSchema = z.object({
  marca: z.string().min(1, 'Marca requerida'),
  cuotas: z.number().int().positive('Las cuotas deben ser mayor a 0'),
  interesPct: z.number().min(0, 'El interés no puede ser negativo'),
  ivaPct: z.number().min(0, 'El IVA no puede ser negativo'),
})

type PlanFormValues = z.infer<typeof planFormSchema>

export function PlanesPagoTab() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<PlanPago | null>(null)

  const { data, isLoading } = useListarPlanesPago(page, LIMIT)
  const { mutate: crear, isPending: creando } = useCrearPlanPago()
  const { mutate: editar, isPending: editandoPending } = useEditarPlanPago()
  const { mutate: desactivar, isPending: desactivando } = useDesactivarPlanPago()

  const planes = data?.data ?? []
  const meta = data?.meta

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: { marca: '', cuotas: 3, interesPct: 0, ivaPct: 21 },
  })

  const abrirCrear = () => {
    setEditando(null)
    form.reset({ marca: '', cuotas: 3, interesPct: 0, ivaPct: 21 })
    setModalOpen(true)
  }

  const abrirEditar = (p: PlanPago) => {
    setEditando(p)
    form.reset({
      marca: p.marca,
      cuotas: p.cuotas,
      interesPct: Number(p.interesPct),
      ivaPct: Number(p.ivaPct),
    })
    setModalOpen(true)
  }

  const onSubmit = (values: PlanFormValues) => {
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

  const formatMarca = (marca: string) => {
    const map: Record<string, string> = {
      VISA: 'Visa',
      MASTERCARD: 'Mastercard',
      AMERICAN_EXPRESS: 'American Express',
    }
    return map[marca] ?? marca
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {meta ? `${meta.total} ${meta.total === 1 ? 'plan' : 'planes'}` : ''}
        </span>
        <Button onClick={abrirCrear} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo plan
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Marca
              </TableHead>
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Cuotas
              </TableHead>
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                Interés
              </TableHead>
              <TableHead className="text-table-header-text text-xs font-semibold uppercase tracking-wider p-3.5">
                IVA
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
            ) : planes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-muted-foreground text-sm">
                  No hay planes de pago configurados
                </TableCell>
              </TableRow>
            ) : (
              planes.map((p, index) => (
                <TableRow
                  key={p.id}
                  className={`hover:bg-table-row-hover transition-colors duration-150 ${
                    index !== planes.length - 1 ? 'border-b border-border/50' : 'border-0'
                  }`}
                >
                  <TableCell className="p-3.5 font-medium">{formatMarca(p.marca)}</TableCell>
                  <TableCell className="p-3.5 text-sm tabular-nums">{p.cuotas}</TableCell>
                  <TableCell className="p-3.5 text-sm tabular-nums">
                    {Number(p.interesPct)}%
                  </TableCell>
                  <TableCell className="p-3.5 text-sm tabular-nums">
                    {Number(p.ivaPct)}%
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
            <DialogTitle>{editando ? 'Editar plan de pago' : 'Nuevo plan de pago'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: VISA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cuotas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuotas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interesPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interés (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? NaN : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ivaPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IVA (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? NaN : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
