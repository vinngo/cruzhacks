'use client'

import dynamic from 'next/dynamic'
import { Panel, Group, Separator } from 'react-resizable-panels'
import ProblemPanel from '@/components/workspace/ProblemPanel'
import CanvasPanel from '@/components/workspace/CanvasPanel'

const TldrawEditor = dynamic(
  () => import('@/components/TldrawEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500 text-lg">Loading canvas...</p>
      </div>
    )
  }
)

export default function WorkspacePage() {
  return (
    <div className="h-screen w-full">
      <Group orientation="horizontal" className="h-full w-full">
        {/* Left: Problem Panel */}
        <Panel defaultSize={20} minSize={15} maxSize={30} className="h-full">
          <ProblemPanel />
        </Panel>

        {/* Resize Handle */}
        <Separator className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize" />

        {/* Center: Canvas Panel */}
        <Panel defaultSize={80} className="h-full">
          <CanvasPanel>
            <TldrawEditor />
          </CanvasPanel>
        </Panel>
      </Group>
    </div>
  )
}
