---
trigger: model_decision
description: When working with state management
---

# 🗂 State Management (Zustand)

- Keep a small global store (auth, theme, network).
- Create feature-specific stores (e.g., `babyStore`, `playerStore`).
- Each store exports a hook: `useXxxStore`.
- Define TypeScript interface for state & actions.
- Use functional updates (`set(state => ...)`).
- Use Zustand only for client/UI state.  
  For server state → use React Query.
- Use middleware (`persist`, `devtools`, `immer`) only when needed.
- Store files in `src/store`.
- Use selectors (`useAuthStore(state => state.user)`) to avoid re-renders.
