# Phase 1: Foundation & Canvas - Research

**Researched:** 2025-01-16
**Domain:** Next.js App Router + tldraw infinite canvas integration
**Confidence:** HIGH

## Summary

This phase requires building a landing page with chat input that transitions to a three-panel workspace featuring an integrated tldraw canvas. The standard approach uses Next.js 15 with App Router, tldraw SDK 4.2.x, Framer Motion for transitions, and browser-based localStorage for session persistence.

**Key architectural decisions:**
- Next.js App Router (server components by default, client components where needed)
- tldraw requires dynamic import with `ssr: false` to avoid hydration errors
- Framer Motion provides smooth page transitions (landing → workspace)
- react-resizable-panels handles the three-panel layout
- localStorage persists canvas state during session (no backend)

**Primary recommendation:** Use the official tldraw Next.js template as a starting point, then layer in Framer Motion transitions and react-resizable-panels for the workspace layout. Mark tldraw as a client component with dynamic import to avoid SSR hydration mismatches.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | React framework with App Router | Industry standard for production React apps, built-in SSR/SSG, excellent DX |
| tldraw | 4.2.x | Infinite canvas SDK | Official React whiteboard library, battle-tested, rich feature set |
| Framer Motion | 12.x | Animation library | Most popular React animation library (12M+ monthly downloads), smooth declarative animations |
| Tailwind CSS | 4.x | Utility-first CSS | Modern default for Next.js projects, zero-config in v4, excellent with App Router |
| TypeScript | 5.x | Type safety | Standard for Next.js projects, tldraw is TypeScript-native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-resizable-panels | 4.4.x | Resizable panel layouts | Three-panel workspace with user-adjustable widths |
| next/dynamic | Built-in | Dynamic imports | SSR opt-out for browser-dependent components (tldraw) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion | CSS View Transitions API | View Transitions is experimental in Next.js 15 (experimental flag), less browser support, but native and lighter |
| react-resizable-panels | CSS Grid + manual resize | More control, but must hand-roll resize logic, accessibility, and state management |
| Tailwind CSS | CSS Modules | More explicit styles, but loses utility-first speed and consistency |

**Installation:**
```bash
# Create Next.js project with TypeScript + Tailwind
npx create-next-app@latest cruzhacks --typescript --tailwind --app

# Install tldraw
npm install tldraw

# Install animation library
npm install framer-motion

# Install panel layout library
npm install react-resizable-panels
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── layout.tsx           # Root layout (serif fonts, global styles)
├── page.tsx             # Landing page (centered chat input)
├── workspace/
│   └── page.tsx         # Workspace view (three panels + canvas)
├── globals.css          # Tailwind imports + custom CSS
components/
├── landing/
│   └── ChatInput.tsx    # Centered input component
├── workspace/
│   ├── ProblemPanel.tsx # Left panel (placeholder in Phase 1)
│   ├── CanvasPanel.tsx  # Center panel with tldraw
│   └── ChatPanel.tsx    # Right panel (collapsed initially)
└── TldrawEditor.tsx     # Dynamically imported tldraw wrapper
```

### Pattern 1: Dynamic Import for tldraw (SSR Avoidance)

**What:** tldraw relies on browser APIs (canvas, localStorage) that don't exist during SSR. Dynamic imports with `ssr: false` prevent hydration errors.

**When to use:** Required for tldraw and any browser-dependent library in Next.js App Router.

**Example:**
```typescript
// components/TldrawEditor.tsx
'use client'

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function TldrawEditor() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw />
    </div>
  )
}

// app/workspace/page.tsx
import dynamic from 'next/dynamic'

const TldrawEditor = dynamic(
  () => import('@/components/TldrawEditor'),
  { ssr: false, loading: () => <div>Loading canvas...</div> }
)

export default function WorkspacePage() {
  return <TldrawEditor />
}
```
Source: [Next.js Dynamic Imports](https://nextjs.org/docs/pages/guides/lazy-loading), [tldraw Next.js template](https://github.com/tldraw/nextjs-template)

### Pattern 2: Framer Motion Page Transitions (App Router)

**What:** Animated transitions between landing page and workspace using Framer Motion with App Router.

**When to use:** For smooth, polished UX when navigating between distinct views.

**Example:**
```typescript
// app/template.tsx (enables exit animations)
'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```
Source: [Solving Framer Motion Page Transitions in Next.js App Router](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router)

### Pattern 3: Three-Panel Layout with Resizable Panels

**What:** Left problem panel (~20%), center canvas (~80%), right chat (collapsible) using react-resizable-panels.

**When to use:** Workspace layout with user-adjustable panel widths.

**Example:**
```typescript
'use client'

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

export default function WorkspaceLayout() {
  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={20} minSize={15} maxSize={30}>
        <ProblemPanel />
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={80}>
        <CanvasPanel />
      </Panel>
    </PanelGroup>
  )
}
```
Source: [react-resizable-panels README](https://github.com/bvaughn/react-resizable-panels)

### Pattern 4: localStorage Persistence for Canvas State

**What:** Save tldraw canvas state to browser localStorage on changes, restore on mount.

**When to use:** Session persistence without backend (Phase 1 requirement).

**Example:**
```typescript
'use client'

import { Tldraw, createTLStore, loadSnapshot, getSnapshot } from 'tldraw'
import { useLayoutEffect, useMemo } from 'react'
import { throttle } from 'lodash' // or custom throttle

const STORAGE_KEY = 'tldraw-canvas-state'

export default function TldrawEditor() {
  const store = useMemo(() => createTLStore(), [])

  useLayoutEffect(() => {
    // Load persisted state
    const persisted = localStorage.getItem(STORAGE_KEY)
    if (persisted) {
      loadSnapshot(store, JSON.parse(persisted))
    }

    // Save on changes (throttled to 500ms)
    const cleanup = store.listen(
      throttle(() => {
        const snapshot = getSnapshot(store)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      }, 500)
    )

    return cleanup
  }, [store])

  return <Tldraw store={store} />
}
```
Source: [tldraw Persistence Docs](https://tldraw.dev/examples/data/assets/local-storage)

### Pattern 5: Customizing tldraw UI (Hide Components)

**What:** Hide unwanted tldraw UI components (menus, style panel) while keeping toolbar visible.

**When to use:** Minimal UI requirement (user decision: "Hide most tldraw UI except drawing tools").

**Example:**
```typescript
import { Tldraw } from 'tldraw'

export default function TldrawEditor() {
  return (
    <Tldraw
      components={{
        ContextMenu: null,
        ActionsMenu: null,
        HelpMenu: null,
        MainMenu: null,
        StylePanel: null,
        // Toolbar: undefined (keep visible)
      }}
    />
  )
}
```
Source: [Hide UI components - tldraw Docs](https://tldraw.dev/examples/ui-components-hidden)

### Pattern 6: Initial Canvas Content (Welcome Hint)

**What:** Add welcome text to empty canvas on first load.

**When to use:** User decision: "Initial canvas state: Welcome hint text".

**Example:**
```typescript
import { Tldraw, createShapeId } from 'tldraw'

export default function TldrawEditor() {
  const handleMount = (editor) => {
    // Only add if canvas is empty
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

  return <Tldraw onMount={handleMount} />
}
```
Source: [Controlling the canvas - tldraw Docs](https://tldraw.dev/examples/api)

### Anti-Patterns to Avoid

- **Don't render tldraw without dynamic import**: Causes "window is not defined" SSR errors and hydration mismatches
- **Don't use Pages Router patterns**: App Router requires `'use client'` directive for interactive components, templates for exit animations
- **Don't save localStorage on every canvas change**: Causes performance issues; throttle/debounce to 500ms
- **Don't forget tldraw CSS import**: `import 'tldraw/tldraw.css'` is required or canvas will be unstyled
- **Don't check `typeof window !== 'undefined'` in render**: Causes hydration errors; use useEffect or dynamic import instead

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Canvas state persistence | Custom localStorage hooks with manual serialization | tldraw's built-in `getSnapshot`/`loadSnapshot` + store.listen | Handles shape serialization, history, assets; custom approach misses edge cases |
| Resizable panels | Custom resize logic with mouse events | react-resizable-panels | Accessibility (keyboard support), touch support, SSR compatibility, nested layouts |
| Page transitions | Custom route change detection + CSS animations | Framer Motion + templates | App Router route lifecycle is complex; exit animations require special handling |
| Drawing tools (pen, shapes, eraser) | Custom canvas implementation | tldraw SDK | Years of UX polish, undo/redo, touch support, shape snapping, text editing |

**Key insight:** Canvas-based UX is deceptively complex. tldraw handles touch events, high-DPI displays, undo/redo stack, shape manipulation, and accessibility. A minimal custom canvas would take weeks to match basic functionality.

## Common Pitfalls

### Pitfall 1: Hydration Errors from Client-Only Components

**What goes wrong:** Importing tldraw directly in a page causes "window is not defined" or "Text content does not match server-rendered HTML" errors.

**Why it happens:** Next.js pre-renders pages on server, but tldraw requires browser APIs (canvas, localStorage) unavailable during SSR.

**How to avoid:**
1. Use `next/dynamic` with `ssr: false`
2. Add `'use client'` directive to component file
3. Wrap in useEffect if dynamic import isn't possible

**Warning signs:**
- Console errors mentioning "window", "document", or "localStorage" during build
- Hydration mismatch warnings
- Blank screen on initial load, content appears after hydration

**References:** [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error), [Leveraging Next.js Dynamic Imports to Solve Hydration Problems](https://dev.to/kawanedres/leveraging-nextjs-dynamic-imports-to-solve-hydration-problems-5086)

### Pitfall 2: Missing tldraw CSS Import

**What goes wrong:** Canvas renders but is completely unstyled (no toolbar, invisible UI, broken layout).

**Why it happens:** tldraw styles are distributed as a separate CSS file that must be explicitly imported.

**How to avoid:** Import `'tldraw/tldraw.css'` in the component file using tldraw.

**Warning signs:**
- Canvas area is visible but toolbar/UI is missing
- Elements are present in DOM inspector but have no styles
- Layout is broken or elements overlap

**References:** [tldraw documentation](https://tldraw.dev/)

### Pitfall 3: Excessive localStorage Writes

**What goes wrong:** Canvas becomes laggy during drawing, browser console shows "QuotaExceededError", or localStorage quota is exhausted.

**Why it happens:** Saving on every canvas change (mousemove, stroke) can trigger thousands of localStorage writes per second.

**How to avoid:** Throttle or debounce saves to 500ms using lodash.throttle or custom implementation.

**Warning signs:**
- Drawing feels sluggish
- Browser DevTools shows excessive localStorage activity
- Console errors about storage quota

**References:** [tldraw localStorage example](https://tldraw.dev/examples/data/assets/local-storage)

### Pitfall 4: Framer Motion Exit Animations Not Working

**What goes wrong:** Entry animations work, but exiting page doesn't animate (instant switch).

**Why it happens:** App Router unmounts components immediately; exit animations require using `template.tsx` instead of `layout.tsx`.

**How to avoid:** Create `app/template.tsx` with motion.div wrapping children (templates re-render on navigation, layouts don't).

**Warning signs:**
- Fade-in works, fade-out is instant
- AnimatePresence has no effect
- Smooth entry, jarring exit

**References:** [Next.js 13 + Framer Motion Page Transitions](https://stackademic.com/blog/next-js-13-framer-motion-page-transitions)

### Pitfall 5: Forgetting tldraw Licensing for Production

**What goes wrong:** SDK works in development but blocks production use without license key.

**Why it happens:** tldraw SDK 4.0+ requires a license for production use (trial, hobby, or commercial).

**How to avoid:**
1. Development: No action needed (works on localhost)
2. Hobby projects: Apply for free hobby license (must show watermark)
3. Commercial: Purchase license ($6000/year for teams <10)

**Warning signs:**
- Works perfectly in `npm run dev`
- Fails or shows license errors in production build
- Deployed app doesn't load tldraw

**References:** [tldraw Licensing](https://tldraw.dev/get-a-license/plans), [License updates for the tldraw SDK](https://tldraw.dev/blog/license-update-for-the-tldraw-sdk)

### Pitfall 6: Serif Font Loading Causing Layout Shift

**What goes wrong:** Landing page text shifts/reflows when custom serif font loads (poor CLS score).

**Why it happens:** Font files load asynchronously; fallback font has different metrics.

**How to avoid:**
1. Use Next.js font optimization: `next/font/google`
2. Preload critical fonts in metadata
3. Use `font-display: swap` or `optional`

**Warning signs:**
- Text "jumps" after page load
- Lighthouse flags CLS issues
- Visible font swap

**References:** [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

## Code Examples

Verified patterns from official sources:

### Complete tldraw Integration with Persistence
```typescript
// components/TldrawEditor.tsx
'use client'

import { Tldraw, createTLStore, loadSnapshot, getSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useLayoutEffect, useMemo } from 'react'

const STORAGE_KEY = 'tldraw-canvas'

export default function TldrawEditor() {
  const store = useMemo(() => createTLStore(), [])

  useLayoutEffect(() => {
    const persisted = localStorage.getItem(STORAGE_KEY)
    if (persisted) {
      loadSnapshot(store, JSON.parse(persisted))
    }

    const throttle = (fn: Function, delay: number) => {
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

    const cleanup = store.listen(
      throttle(() => {
        const snapshot = getSnapshot(store)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      }, 500)
    )

    return cleanup
  }, [store])

  return (
    <div className="fixed inset-0">
      <Tldraw
        store={store}
        components={{
          ContextMenu: null,
          ActionsMenu: null,
          HelpMenu: null,
          MainMenu: null,
          StylePanel: null,
        }}
      />
    </div>
  )
}
```
Source: [tldraw localStorage example](https://tldraw.dev/examples/data/assets/local-storage)

### Three-Panel Workspace Layout
```typescript
// app/workspace/page.tsx
'use client'

import dynamic from 'next/dynamic'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

const TldrawEditor = dynamic(() => import('@/components/TldrawEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      Loading canvas...
    </div>
  ),
})

export default function WorkspacePage() {
  return (
    <div className="h-screen">
      <PanelGroup direction="horizontal">
        {/* Left: Problem Panel */}
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full bg-gray-50 p-4">
            <h2 className="text-lg font-semibold mb-2">Problem</h2>
            <p className="text-sm text-gray-600">
              Problem content will appear here in Phase 2
            </p>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors" />

        {/* Center: Canvas */}
        <Panel defaultSize={80}>
          <TldrawEditor />
        </Panel>
      </PanelGroup>
    </div>
  )
}
```
Source: [react-resizable-panels examples](https://github.com/bvaughn/react-resizable-panels)

### Landing Page with Framer Motion Transition
```typescript
// app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const [problem, setProblem] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (problem.trim()) {
      // Navigate to workspace (transition handled by template.tsx)
      router.push('/workspace')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full px-6"
      >
        <h1 className="text-4xl font-serif text-center mb-8">
          AI Problem Solver
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Describe your problem..."
            className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Working
          </button>
        </form>
      </motion.div>
    </div>
  )
}
```
Source: [Framer Motion documentation](https://motion.dev/)

### Tailwind CSS Setup (Next.js 15 + Tailwind v4)
```css
/* app/globals.css */
@import "tailwindcss";

/* Custom serif font for academic feel */
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&display=swap');

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1, h2, h3 {
  font-family: 'Crimson Text', serif;
}
```

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```
Source: [Install Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router (`pages/` directory) | App Router (`app/` directory) | Next.js 13 (2022), stable in 14 | Server Components by default, nested layouts, streaming, better data fetching |
| Tailwind v3 with config file | Tailwind v4 zero-config | Dec 2024 | No tailwind.config.js needed, CSS-first configuration, simpler setup |
| tldraw v1 (MIT license) | tldraw v2+ (commercial license) | SDK 4.0 (Sept 2024) | Hobby license free with watermark, production requires license key |
| Framer Motion for all animations | View Transitions API (experimental) | Next.js 15.3 (Jan 2025) | Native browser API, lighter bundle, but experimental and limited browser support |
| Manual CSS Grid layouts | react-resizable-panels | 2023+ | Declarative API, SSR support, accessibility built-in, 1400+ projects using it |

**Deprecated/outdated:**
- **Pages Router for new projects**: Still supported but App Router is recommended (better performance, newer React features)
- **Tailwind v3 with extensive config**: v4 uses zero-config approach with CSS-first configuration
- **tldraw v1 (MIT)**: No longer maintained; SDK 4.x is the current version (different license)
- **Client-side-only persistence**: Modern apps use server sync (Phase 2+ will add backend), but localStorage is acceptable for Phase 1

## Open Questions

Things that couldn't be fully resolved:

1. **Framer Motion vs View Transitions API for page transitions**
   - What we know: View Transitions is experimental in Next.js 15.3 (requires flag), native and lighter
   - What's unclear: How stable is the experimental flag? Will it be stable in Next.js 15.4/16?
   - Recommendation: Use Framer Motion for Phase 1 (proven, stable). Consider View Transitions in future if it becomes stable.

2. **tldraw licensing for hackathon/student projects**
   - What we know: Hobby license is free but requires watermark; commercial license is $6000/year
   - What's unclear: Does "hackathon project" qualify for hobby license? Is watermark acceptable for this project?
   - Recommendation: Apply for hobby license (free), verify watermark is acceptable for project requirements. If watermark is unacceptable, budget for commercial license or consider alternative canvas libraries.

3. **Optimal throttle delay for localStorage saves**
   - What we know: tldraw example uses 500ms throttle
   - What's unclear: Is 500ms optimal for all use cases? Trade-off between data loss risk and performance?
   - Recommendation: Start with 500ms (matches official example), then adjust based on testing. Lower (200-300ms) for more frequent saves, higher (1000ms) if performance issues.

4. **Serif font choices for academic feel**
   - What we know: User wants serif fonts for academic feel; Playfair Display, Merriweather, Georgia are popular
   - What's unclear: Specific font preference, where to apply (headings only vs body text)
   - Recommendation: Crimson Text or Merriweather for headings (Google Fonts, free, optimized). User's discretion per CONTEXT.md.

## Sources

### Primary (HIGH confidence)
- [Next.js Official Documentation](https://nextjs.org/docs) - App Router, dynamic imports, metadata
- [tldraw Official Documentation](https://tldraw.dev/) - Integration, persistence, UI customization
- [tldraw Next.js Template](https://github.com/tldraw/nextjs-template) - Reference implementation for App Router
- [Tailwind CSS Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) - Official setup instructions
- [react-resizable-panels GitHub](https://github.com/bvaughn/react-resizable-panels) - Library documentation
- [Framer Motion Documentation](https://motion.dev/) - Animation patterns

### Secondary (MEDIUM confidence)
- [Solving Framer Motion Page Transitions in Next.js App Router](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router) - Community solution for App Router
- [LogRocket: Advanced page transitions with Next.js and Framer Motion](https://blog.logrocket.com/advanced-page-transitions-next-js-framer-motion/) - Detailed implementation guide
- [DEV: Leveraging Next.js Dynamic Imports to Solve Hydration Problems](https://dev.to/kawanedres/leveraging-nextjs-dynamic-imports-to-solve-hydration-problems-5086) - Hydration error solutions
- [tldraw Licensing Information](https://tldraw.dev/get-a-license/plans) - Official license documentation
- [Modern Layout Design Techniques in ReactJS (2025 Guide)](https://dev.to/er-raj-aryan/modern-layout-design-techniques-in-reactjs-2025-guide-3868) - Layout best practices

### Tertiary (LOW confidence)
- WebSearch results for tldraw common pitfalls - Limited specific documentation found
- WebSearch results for serif fonts 2025 - General typography trends, not technical implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries have official Next.js integration docs, tldraw has official template
- Architecture: HIGH - Patterns verified with official documentation and working examples
- Pitfalls: MEDIUM-HIGH - Hydration errors and licensing documented officially, some pitfalls inferred from community experience

**Research date:** 2025-01-16
**Valid until:** 2025-02-15 (30 days - stable ecosystem, Next.js 15 and tldraw 4.x are current stable versions)

**Notes:**
- Next.js 16 is mentioned in sources but not yet stable; research assumes Next.js 15.x
- Tailwind v4 zero-config approach is very new (Dec 2024); traditional config approach still works
- tldraw licensing changed significantly in SDK 4.0 (Sept 2024); verify license requirements before production deployment
