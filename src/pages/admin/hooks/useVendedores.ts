import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'

export function useListarVendedores(page: number, limit: number, sucursalId?: string) {
  return useQuery({
    queryKey: ['vendedores', page, sucursalId],
    queryFn: () => adminApi.vendedores.listar(page, limit, sucursalId),
  })
}