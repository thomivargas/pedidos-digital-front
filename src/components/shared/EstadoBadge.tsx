import { Badge } from '@/components/ui/badge'
import type { EstadoPedido } from '@/types'

const config: Record<EstadoPedido, { label: string; className: string }> = {
  PENDIENTE: {
    label: 'Pendiente',
    className: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
  },
  ENVIADO_A_CAJA: {
    label: 'En caja',
    className: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50',
  },
  COMPLETADO: {
    label: 'Completado',
    className: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-50',
  },
}

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const { label, className } = config[estado]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
