import { ReactNode } from 'react'

interface CanvasPanelProps {
  children: ReactNode
}

export default function CanvasPanel({ children }: CanvasPanelProps) {
  return (
    <div className="h-full relative">
      {children}
    </div>
  )
}
