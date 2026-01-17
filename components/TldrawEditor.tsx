'use client'

import { Tldraw, createTLStore, loadSnapshot, getSnapshot, createShapeId } from 'tldraw'
import 'tldraw/tldraw.css'
import { useLayoutEffect, useMemo } from 'react'

const STORAGE_KEY = 'socratic-whiteboard-canvas'

// Custom throttle function to avoid external dependencies
function throttle(fn: Function, delay: number) {
  let timeout: NodeJS.Timeout | null = null
  return (...args: any[]) => {
    if (!timeout) {
      timeout = setTimeout(() => {
        fn(...args)
        timeout = null
      }, delay)
    }
  }
}

export default function TldrawEditor() {
  const store = useMemo(() => createTLStore(), [])

  useLayoutEffect(() => {
    // Load persisted state from localStorage
    const persisted = localStorage.getItem(STORAGE_KEY)
    if (persisted) {
      try {
        loadSnapshot(store, JSON.parse(persisted))
      } catch (error) {
        console.error('Failed to load canvas state:', error)
      }
    }

    // Save to localStorage on changes (throttled to 500ms)
    const cleanup = store.listen(
      throttle(() => {
        const snapshot = getSnapshot(store)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      }, 500)
    )

    return cleanup
  }, [store])

  const handleMount = (editor: any) => {
    // Add welcome hint text if canvas is empty
    if (editor.getCurrentPageShapeIds().size === 0) {
      editor.createShapes([
        {
          id: createShapeId('welcome'),
          type: 'text',
          x: 200,
          y: 200,
          props: {
            text: 'Start working on your problem here...',
            size: 'm',
            color: 'grey',
          },
        },
      ])
    }
  }

  return (
    <div className="fixed inset-0">
      <Tldraw
        store={store}
        onMount={handleMount}
        components={{
          ContextMenu: null,
          ActionsMenu: null,
          HelpMenu: null,
          MainMenu: null,
          StylePanel: null,
          // Toolbar remains visible (undefined means keep default)
        }}
      />
    </div>
  )
}
