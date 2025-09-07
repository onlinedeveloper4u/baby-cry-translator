---
trigger: always_on
---

# General Code Style & Formatting

* Use functional and declarative programming patterns; avoid classes.
* Prefer iteration and modularization over code duplication.
* Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
* Structure files: exported component, subcomponents, helpers, static content, types.
* Follow Expo's official documentation for setup and configuration.

# Naming Conventions

* Use lowercase with dashes for directories (e.g., components/auth-wizard).
* Favor named exports for components.
* Use PascalCase for component files (e.g., BabyCryScreen.tsx).
* Use camelCase for hooks, utils, and Zustand store files (e.g., useAuthStore.ts).

# TypeScript Best Practices

* Use TypeScript everywhere; prefer interfaces over types.
* Avoid `any` and enums; use explicit types and maps instead.
* Use functional components with TypeScript interfaces.
* Enable strict mode for better type safety.
* Type all Zustand states and Supabase responses.

# Syntax & Formatting

* Use the `function` keyword for pure functions.
* Avoid unnecessary curly braces in conditionals.
* Use declarative JSX.
* Use Prettier for consistent formatting.
* Use absolute imports with `@/*`.

# Styling & UI (NativeWind)

* Use NativeWind with the `className` prop as the primary styling method.
* Define global theme (colors, fonts, spacing, breakpoints) in `tailwind.config.js`.
* Prefer utility-first classes over inline styles.
* Use conditional classes with template strings or `clsx`.
* Place reusable UI primitives (Button, Card, Input) in `src/components/ui`.
* Support dark mode with `useColorScheme` and `dark:` variants.
* Use Flexbox and spacing utilities (`flex`, `justify-`, `items-`, `gap-`) for layout.
* Extend Tailwind for brand colors, shadows, typography.
* Apply responsive modifiers (`sm:`, `md:`, `lg:`).
* Avoid mixing `className` with inline style unless dynamic.

# State Management (Zustand)

* Use a small global store (auth session, theme, network).
* Create feature-specific stores (e.g., playerStore, babyStore).
* Each store must export a hook `useXxxStore`.
* Define TypeScript interface for state and actions.
* Use functional updates (`set(state => ...)`) instead of merges.
* Keep Zustand for client/UI state only.
* Do not use Zustand for server state; use React Query instead.
* Use middleware (persist, devtools, immer) only when needed.
* Store files go in `src/store`.
* Use selectors (`useAuthStore(state => state.user)`) to avoid re-renders.

# Data Layer (Supabase)

* Initialize client in `src/config/supabase.ts`.
* Place queries/mutations in `src/api/*`; never call Supabase directly from components.
* Use React Query for fetching, caching, syncing.
* Always type responses using Supabase types.
* Organize API by domain (`auth.ts`, `babies.ts`, `cries.ts`).
* Wrap calls in `try/catch` and send errors to Sentry in production.
* Use descriptive React Query keys (e.g., `["babies", userId]`).
* Store large files in Supabase Storage; only metadata in Postgres.
* Keep all DB logic centralized.
* Export table/column constants from `src/config/db.ts`.

# Data Fetching (React Query)

* Use `useQuery`, `useMutation`, `useInfiniteQuery` for all server-side data.
* Colocate hooks near components, keep actual API in `src/api`.
* Use descriptive query keys (e.g., `["cry-history", babyId]`).
* Use cache instead of Zustand for server state.
* Configure defaults in `src/config/queryClient.ts`.
* Invalidate queries after mutations with `queryClient.invalidateQueries`.
* Handle `isLoading`, `isError`, `error` states explicitly.
* Use `select` to transform data before UI.
* Log exceptions to Sentry.
* Use `enabled: false` for conditional queries.

# Audio Handling (Expo AV)

* Use Expo AV’s Audio API for recording and playback.
* Encapsulate logic in hooks (`useAudioRecorder`, `useAudioPlayer`).
* Request microphone permissions before recording.
* Save recordings temporarily; upload to Supabase Storage.
* Store only metadata (file path, duration).
* Clean up `Audio.Sound` instances with `unloadAsync`.
* Use React Query mutations for uploads.
* Keep audio constants in `src/config/audio.ts`.
* Show user feedback (waveform, timer).

# Internationalization (i18n)

* Use `react-i18next` for translations.
* Store locale files in `src/locales` (en.json, ur.json, ar.json).
* Wrap app with `I18nextProvider`.
* Never hardcode strings; use `t()`.
* Organize keys by feature (`auth.login.title`).
* Default fallback language is English (`en`).
* Enable RTL (Arabic, Urdu) with `I18nManager`.
* Use `useTranslation` in components.
* Add language switcher in settings (persist via Zustand/AsyncStorage).
* Validate all user-facing text is translated.

# Error Monitoring (Sentry)

* Initialize in `app/_layout.tsx`.
* Use `Sentry.captureException(error)` in async ops.
* Wrap routes in Error Boundaries.
* Never send sensitive data (tokens, PII, audio).
* Tag events with environment (dev, staging, prod).
* Use breadcrumbs for key events (recording started, API calls).
* Upload source maps for stack traces.
* Sanitize errors with `beforeSend`.
* Enable performance tracing in prod.
* Test integration with `Sentry.captureMessage("Test error")`.

# Folder Structure

* `app/` → Expo Router screens & layouts
* `src/components/` → Reusable UI components
* `src/components/ui` → NativeWind-styled primitives (Button, Card, Input)
* `src/hooks/` → Custom hooks (useAudioRecorder, useAuth)
* `src/store/` → Zustand stores (auth.ts, global.ts, player.ts)
* `src/api/` → Supabase API functions by domain
* `src/config/` → Config (supabase.ts, queryClient.ts, audio.ts, db.ts)
* `src/locales/` → i18n JSON files (en.json, ur.json, ar.json)
* `src/types/` → Global TS types & interfaces
* `src/utils/` → Helpers & utils
* `assets/` → Images, fonts, icons