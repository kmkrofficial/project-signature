# `src/context/` — React Context Providers

This directory houses React Contexts for cross-component state management.

## Key Files

- **`ToastContext.tsx`**: Provides application-wide toast notification dispatching:
  - Manages an array of active toast notifications with unique IDs.
  - Exposes `addToast(message, type, duration)` and `removeToast(id)` methods.
  - Renders the floating `<Toast>` container fixed at the bottom-right of the viewport.
