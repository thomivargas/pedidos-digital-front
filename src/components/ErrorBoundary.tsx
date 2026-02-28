import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-2xl font-bold">Algo salió mal</h1>
          <p className="text-muted-foreground">Ocurrió un error inesperado.</p>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
