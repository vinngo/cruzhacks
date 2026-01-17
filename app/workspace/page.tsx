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
    <div className="h-screen w-full flex">
      <Group orientation="horizontal" style={{ height: '100%', width: '100%' }}>
        {/* Left: Problem Panel */}
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <ProblemPanel />
        </Panel>

        {/* Resize Handle */}
        <Separator style={{ width: '4px' }} className="bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize" />

        {/* Center: Canvas Panel */}
        <Panel defaultSize={80}>
          <CanvasPanel>
            <TldrawEditor />
          </CanvasPanel>
        </Panel>
      </Group>
    </div>
  )
}
