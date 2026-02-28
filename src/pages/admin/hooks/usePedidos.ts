import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { toast } from 'sonner'
import type { EstadoPedido } from '@/types'

interface ParamsType { 
    page?: number | undefined; 
    limit?: number | undefined; 
    estado?: "" | EstadoPedido | undefined; 
    vendedorId?: string | undefined; 
}

export function useListarPedidos(params: ParamsType) {
  return useQuery({
    queryKey: ['admin-pedidos', params.page, params.estado, params.vendedorId],
    queryFn: () => adminApi.pedidos.listar(params),
  })
}

export function useCompletarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.pedidos.completar,
    onSuccess: () => {
      toast.success('Pedido completado')
      void queryClient.invalidateQueries({ queryKey: ['admin-pedidos'] })
    },
    onError: () => toast.error('No se pudo completar el pedido'),
  })
}