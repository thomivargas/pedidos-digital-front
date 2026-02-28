import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { pedidosApi } from '@/api/pedidos'
import { permutasApi } from '@/api/permutas'
import { planesPagoApi } from '@/api/planes-pago'
import type { MetodoPago } from '@/types'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z
  .object({
    nombreProducto: z.string().min(1, 'El nombre del producto es requerido'),
    sku: z.string().min(1, 'El SKU es requerido'),
    precio: z.number().positive('El precio debe ser mayor a 0'),
    cotizacionDolar: z.number().positive('La cotización debe ser mayor a 0'),
    observacion: z.string().optional(),
    metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']),
    planPagoId: z.string().optional(),
    tienePermuta: z.boolean(),
    permutaModelo: z.string().optional(),
    permutaBateria: z.number().int().min(0).max(100).optional(),
    permutaValorUsd: z.number().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.metodoPago === 'TARJETA' && !data.planPagoId) return false
      return true
    },
    { message: 'Seleccioná un plan de pago', path: ['planPagoId'] },
  )

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NuevoPedidoModal({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombreProducto: '',
      sku: '',
      precio: 0,
      cotizacionDolar: 0,
      observacion: '',
      metodoPago: 'EFECTIVO',
      planPagoId: '',
      tienePermuta: false,
      permutaModelo: '',
      permutaBateria: undefined,
      permutaValorUsd: undefined,
    },
  })

  const metodoPago = form.watch('metodoPago')
  const tienePermuta = form.watch('tienePermuta')
  const permutaModelo = form.watch('permutaModelo')
  const permutaBateria = form.watch('permutaBateria')

  const { data: permutasData } = useQuery({
    queryKey: ['permutas-catalogo'],
    queryFn: () => permutasApi.listar(1, 100),
    enabled: open,
  })

  const { data: planesData } = useQuery({
    queryKey: ['planes-pago-catalogo'],
    queryFn: () => planesPagoApi.listar(1, 100),
    enabled: open,
  })

  const permutas = permutasData?.data ?? []
  const planes = planesData?.data ?? []

  // Get unique model names for permuta select
  const modelosUnicos = useMemo(() => {
    const nombres = [...new Set(permutas.map((p) => p.nombre))]
    return nombres.sort()
  }, [permutas])

  // Find reference price from catalog based on selected model + battery
  const precioReferencia = useMemo(() => {
    if (!permutaModelo || permutaBateria == null) return null
    const match = permutas.find(
      (p) => p.nombre === permutaModelo && permutaBateria >= p.bateriaMin && permutaBateria <= p.bateriaMax,
    )
    return match ? Number(match.precioUsd) : null
  }, [permutas, permutaModelo, permutaBateria])

  const { mutate, isPending } = useMutation({
    mutationFn: pedidosApi.crear,
    onSuccess: () => {
      toast.success('Pedido creado correctamente')
      void queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] })
      onOpenChange(false)
      form.reset()
    },
    onError: () => {
      toast.error('Error al crear el pedido')
    },
  })

  const onSubmit = (values: FormValues) => {
    const { tienePermuta: _, ...rest } = values
    mutate({
      ...rest,
      observacion: rest.observacion || undefined,
      planPagoId: rest.metodoPago === 'TARJETA' ? rest.planPagoId : undefined,
      permutaModelo: tienePermuta ? rest.permutaModelo : undefined,
      permutaBateria: tienePermuta ? rest.permutaBateria : undefined,
      permutaValorUsd: tienePermuta ? rest.permutaValorUsd : undefined,
    })
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) form.reset()
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo pedido</DialogTitle>
          <DialogDescription>Completá los datos del producto para crear el pedido.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombreProducto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: iPhone 14 Pro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: IP14P-256GB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precio"
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
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? NaN : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cotizacionDolar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cotización USD</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? NaN : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Método de pago */}
            <FormField
              control={form.control}
              name="metodoPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pago</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v as MetodoPago)
                      if (v !== 'TARJETA') form.setValue('planPagoId', '')
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                      <SelectItem value="TARJETA">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan de pago (solo si TARJETA) */}
            {metodoPago === 'TARJETA' && (
              <FormField
                control={form.control}
                name="planPagoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan de pago</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {planes.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.marca} {plan.cuotas} cuotas - {Number(plan.interesPct)}% interés
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Observación */}
            <FormField
              control={form.control}
              name="observacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observación (opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-15 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Notas adicionales sobre el pedido..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Permuta */}
            <div className="space-y-3 rounded-lg border border-border p-3">
              <FormField
                control={form.control}
                name="tienePermuta"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (!checked) {
                            form.setValue('permutaModelo', '')
                            form.setValue('permutaBateria', undefined)
                            form.setValue('permutaValorUsd', undefined)
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      El cliente entrega un equipo (permuta)
                    </FormLabel>
                  </FormItem>
                )}
              />

              {tienePermuta && (
                <div className="space-y-3 pt-1">
                  <FormField
                    control={form.control}
                    name="permutaModelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar modelo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modelosUnicos.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permutaBateria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batería (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Ej: 85"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        {precioReferencia !== null && (
                          <p className="text-xs text-muted-foreground">
                            Precio de referencia: <span className="font-semibold text-foreground">${precioReferencia}</span> USD
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permutaValorUsd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor asignado (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Creando...' : 'Crear pedido'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
