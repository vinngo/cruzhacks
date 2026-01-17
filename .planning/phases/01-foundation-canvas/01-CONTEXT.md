# Phase 1: Foundation & Canvas - Context

**Gathered:** 2025-01-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Building the initial landing page with centered chat input and the workspace with a functional tldraw canvas. Users arrive at a clean landing page, then transition to a three-panel workspace (problem panel, canvas, chat area) where they can draw and write freely on the canvas.

</domain>

<decisions>
## Implementation Decisions

### UI - Landing Page
- Clean ChatGPT/Claude style: centered input, minimal branding, lots of whitespace
- Use serif fonts when appropriate to create an "academic" feel
- Minimal UI, focus on the input as primary CTA

### UI - Workspace Layout
- Three-panel layout: Left problem panel (~20%), center canvas (~80%), right chat (collapsed initially)
- Chat slides in from right when needed
- Canvas is visually dominant (clear hierarchy)
- Problem panel shows placeholder content in Phase 1 (actual problem displays in Phase 2)

### UX - Transition
- Use framer-motion for page transitions
- Smooth animated transition from landing → workspace

### Canvas
- Hide most tldraw UI except drawing tools (minimal UI overlay)
- Initial canvas state: Welcome hint text (e.g., "Start working on your problem here...")
- tldraw provides standard drawing tools (pen, shapes, eraser)

### Claude's Discretion
- Exact animation style for transitions (fade, slide, etc.)
- Specific serif font choices
- Exact placeholder text and styling
- Problem panel placeholder content design
- Canvas welcome hint exact copy and positioning
- Spacing, typography details

</decisions>

<specifics>
## Specific Ideas

- Landing page inspiration: ChatGPT/Claude initial screen (centered input, clean)
- Academic feel via serif typography where appropriate (not everywhere)
- Canvas should feel like a workspace, not cluttered with UI chrome

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-canvas*
*Context gathered: 2025-01-16*
