import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PackageCheck, Users, MapPin, Smartphone, CreditCard } from 'lucide-react'

import { PedidosTab } from './tabs/PedidosTab'
import { VendedoresTab } from './tabs/VendedoresTab'
import { SucursalesTab } from './tabs/SucursalesTab'
import { PermutasTab } from './tabs/PermutasTab'
import { PlanesPagoTab } from './tabs/PlanesPagoTab'

export function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de admin</h1>
      </div>

      <Tabs defaultValue="pedidos">
        <TabsList className="mb-4">
          <TabsTrigger value="pedidos" className="gap-2">
            <PackageCheck className="h-4 w-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="vendedores" className="gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="sucursales" className="gap-2">
            <MapPin className="h-4 w-4" />
            Sucursales
          </TabsTrigger>
          <TabsTrigger value="permutas" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Permutas
          </TabsTrigger>
          <TabsTrigger value="planes-pago" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Planes de Pago
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos">
          <Card className="border-none shadow-none bg-transparent p-0">
            <CardContent className="px-0">
              <PedidosTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendedores">
          <Card className="border-none shadow-none bg-transparent p-0">
            <CardContent className="px-0">
              <VendedoresTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sucursales">
          <Card className="border-none shadow-none bg-transparent p-0">
            <CardContent className="px-0">
              <SucursalesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permutas">
          <Card className="border-none shadow-none bg-transparent p-0">
            <CardContent className="px-0">
              <PermutasTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planes-pago">
          <Card className="border-none shadow-none bg-transparent p-0">
            <CardContent className="px-0">
              <PlanesPagoTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
