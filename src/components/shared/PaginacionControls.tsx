import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginatedMeta } from '@/types'

interface Props {
  meta: PaginatedMeta
  onPageChange: (page: number) => void
}

export function PaginacionControls({ meta, onPageChange }: Props) {
  const { page, totalPages, total, limit } = meta

  if (total <= limit) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between border-t px-1 pt-4">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? 'Sin resultados' : `${from}–${to} de ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!meta.hasPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          {page} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!meta.hasNext}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
