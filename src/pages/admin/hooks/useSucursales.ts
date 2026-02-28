import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'

export function useListarSucursales(page: number, limit: number) {
  return useQuery({
    queryKey: ['sucursales', page],
    queryFn: () => adminApi.sucursales.listar(page, limit),
  })
}