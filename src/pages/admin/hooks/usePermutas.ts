import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminPermutasApi, type CrearPermutaDto } from '@/api/permutas'

export function useListarPermutas(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin-permutas', page, limit],
    queryFn: () => adminPermutasApi.listar(page, limit),
  })
}

export function useCrearPermuta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminPermutasApi.crear,
    onSuccess: () => {
      toast.success('Permuta creada')
      void queryClient.invalidateQueries({ queryKey: ['admin-permutas'] })
    },
    onError: () => toast.error('No se pudo crear la permuta'),
  })
}

export function useEditarPermuta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CrearPermutaDto> }) =>
      adminPermutasApi.editar(id, dto),
    onSuccess: () => {
      toast.success('Permuta actualizada')
      void queryClient.invalidateQueries({ queryKey: ['admin-permutas'] })
    },
    onError: () => toast.error('No se pudo actualizar la permuta'),
  })
}

export function useDesactivarPermuta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminPermutasApi.desactivar,
    onSuccess: () => {
      toast.success('Permuta desactivada')
      void queryClient.invalidateQueries({ queryKey: ['admin-permutas'] })
    },
    onError: () => toast.error('No se pudo desactivar la permuta'),
  })
}
