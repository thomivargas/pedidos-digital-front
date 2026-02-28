import { apiClient } from './client'
import type { LoginResponse } from '@/types'

export const authApi = {
  login: async (correo: string, contrasena: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { correo, contrasena })
    return data
  },
}
