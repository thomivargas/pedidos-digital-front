import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import axios from 'axios'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'

const schema = z.object({
  correo: z.string().email('Ingresá un correo válido'),
  contrasena: z.string().min(1, 'La contraseña es requerida'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      navigate(user.rol === 'ADMIN' ? '/admin' : '/vendedor', { replace: true })
    }
  }, [user, isLoading, navigate])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { correo: '', contrasena: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await login(values.correo, values.contrasena)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error('Credenciales incorrectas')
      } else {
        toast.error('Error al conectar con el servidor')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Toaster richColors position="top-right" />
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos Digital</h1>
          <p className="text-sm text-muted-foreground">Sistema de gestión de pedidos</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Iniciar sesión</CardTitle>
            <CardDescription>Ingresá tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="nombre@empresa.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contrasena"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
