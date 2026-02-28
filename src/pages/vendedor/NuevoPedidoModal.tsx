import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { pedidosApi } from '@/api/pedidos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

// z.number() (no coerce) para evitar el tipo `unknown` de z.coerce en Zod v4.
// La conversión string→number se maneja manualmente en el onChange del Input.
const schema = z.object({
  nombreProducto: z.string().min(1, 'El nombre del producto es requerido'),
  sku: z.string().min(1, 'El SKU es requerido'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  cotizacionDolar: z.number().positive('La cotización debe ser mayor a 0'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NuevoPedidoModal({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombreProducto: '', sku: '', precio: 0, cotizacionDolar: 0 },
  })

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

  const onSubmit = (values: FormValues) => mutate(values)

  const handleOpenChange = (val: boolean) => {
    if (!val) form.reset()
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
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
                    <Input placeholder="Ej: Zapatillas Nike Air Max" {...field} />
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
                    <Input placeholder="Ej: NK-AM-001" {...field} />
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
