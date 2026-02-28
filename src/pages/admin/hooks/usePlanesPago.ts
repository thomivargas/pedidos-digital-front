import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminPlanesPagoApi, type CrearPlanPagoDto } from '@/api/planes-pago'

export function useListarPlanesPago(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin-planes-pago', page, limit],
    queryFn: () => adminPlanesPagoApi.listar(page, limit),
  })
}

export function useCrearPlanPago() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminPlanesPagoApi.crear,
    onSuccess: () => {
      toast.success('Plan de pago creado')
      void queryClient.invalidateQueries({ queryKey: ['admin-planes-pago'] })
    },
    onError: () => toast.error('No se pudo crear el plan de pago'),
  })
}

export function useEditarPlanPago() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CrearPlanPagoDto> }) =>
      adminPlanesPagoApi.editar(id, dto),
    onSuccess: () => {
      toast.success('Plan de pago actualizado')
      void queryClient.invalidateQueries({ queryKey: ['admin-planes-pago'] })
    },
    onError: () => toast.error('No se pudo actualizar el plan'),
  })
}

export function useDesactivarPlanPago() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminPlanesPagoApi.desactivar,
    onSuccess: () => {
      toast.success('Plan de pago desactivado')
      void queryClient.invalidateQueries({ queryKey: ['admin-planes-pago'] })
    },
    onError: () => toast.error('No se pudo desactivar el plan'),
  })
}
