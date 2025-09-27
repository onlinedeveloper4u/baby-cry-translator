---
generatedFrom: .cursor/rules
alwaysApply: true
---

# Workspace AI / Copilot Instructions

This file was generated automatically by copying the project's Cursor rules from `.cursor/rules` into a single workspace-wide Copilot instructions file. It should be applied to all chat/code generation requests in this repository.

Note: the original source files are kept in `.cursor/rules` and this file mirrors their contents.

## General Code Style & Formatting

- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files in this order:
  1. Exported component
  2. Subcomponents
  3. Helpers
  4. Static content
  5. Types
- Follow Expo's official documentation for setup and configuration.

## Syntax & Formatting

- Use `function` keyword for pure functions.
- Avoid unnecessary curly braces in conditionals.
- Use declarative JSX.
- Format with Prettier.
- Use absolute imports (`@/*`) configured in `tsconfig.json`.

## TypeScript Best Practices

- Use TypeScript everywhere.
- Prefer interfaces over type.
- Avoid `any` and `enum`; use explicit types and maps instead.
- Use functional components with interfaces.
- Enable `strict` mode in `tsconfig.json`.
- Type all Zustand states and Supabase responses.

## Naming Conventions

- Directories: lowercase with dashes (e.g., `components/auth-wizard`).
- Components: PascalCase (e.g., `BabyCryScreen.tsx`).
- Hooks / utils / stores: camelCase (e.g., `useAuthStore.ts`).
- Prefer **named exports** for components.

## Folder Structure

- app/ → Expo Router screens & layouts
- src/components/ → Reusable UI components
- src/components/ui → NativeWind-styled primitives (Button, Card, Input)
- src/hooks/ → Custom hooks (useAudioRecorder, useAuth)
- src/store/ → Zustand stores (auth.ts, global.ts, player.ts)
- src/api/ → Supabase API functions by domain
- src/config/ → Config (supabase.ts, queryClient.ts, audio.ts, db.ts)
- src/locales/ → i18n JSON files (en.json, ur.json, ar.json)
- src/types/ → Global TS types & interfaces
- src/utils/ → Helpers & utils
- assets/ → Images, fonts, icons

## Styling & UI (NativeWind)

- Use `className` with NativeWind as the primary styling method.
- Define global theme in `tailwind.config.js`.
- Prefer utility-first classes over inline styles.
- Use `clsx` or template strings for conditional classes.
- Place reusable primitives in `src/components/ui` (Button, Card, Input).
- Support dark mode with `useColorScheme` + `dark:` variants.
- Use Flexbox + spacing utilities (`flex`, `justify-`, `gap-`) for layout.
- Extend Tailwind with brand colors, shadows, typography.
- Apply responsive modifiers (`sm:`, `md:`, `lg:`).
- Avoid mixing `className` with `style` unless strictly necessary.

## State Management (Zustand)

- Keep a small global store (auth, theme, network).
- Create feature-specific stores (e.g., `babyStore`, `playerStore`).
- Each store exports a hook: `useXxxStore`.
- Define TypeScript interface for state & actions.
- Use functional updates (`set(state => ...)`).
- Use Zustand only for client/UI state. For server state → use React Query.
- Use middleware (`persist`, `devtools`, `immer`) only when needed.
- Store files in `src/store`.
- Use selectors (`useAuthStore(state => state.user)`) to avoid re-renders.

## Error Monitoring (Sentry)

- Initialize in `app/_layout.tsx` using Expo SDK integration.
- Use `Sentry.captureException(error)` in async operations.
- Wrap routes in Error Boundaries.
- Never send sensitive data (tokens, PII, audio).
- Tag events with environment (dev, staging, prod).
- Use breadcrumbs for key events.
- Upload source maps (`expo export --sourcemap`).
- Sanitize errors with `beforeSend`.
- Enable performance tracing in production.
- Test integration with `Sentry.captureMessage("Test error")`.

## Internationalization (i18n)

- Use `react-i18next` for translations.
- Store locale files in `src/locales` (`en.json`, `ur.json`, `ar.json`).
- Wrap app in `I18nextProvider`.
- Never hardcode strings; use `t()`.
- Organize keys by feature (`auth.login.title`).
- Default fallback language: English.
- Enable RTL (Arabic, Urdu) with `I18nManager`.
- Use `useTranslation` in components.
- Add language switcher (persist with Zustand/AsyncStorage).
- Validate all user-facing text is translated.

## Data Fetching (React Query)

- Use `useQuery`, `useMutation`, `useInfiniteQuery` for server state.
- Co-locate hooks near components, API in `src/api`.
- Use descriptive query keys (`["cry-history", babyId]`).
- Use cache, not Zustand, for server state.
- Configure defaults in `src/config/queryClient.ts`.
- Invalidate queries after mutations.
- Handle `isLoading`, `isError`, `error` explicitly.
- Use `select` to transform data before UI.
- Log exceptions to Sentry.
- Use `enabled: false` for conditional queries.

## Expo (Framework) Guidelines

### Purpose
- Ensure all React Native work follows Expo SDK ~51 conventions.
- Keep dependencies Expo-compatible and consistent with `versions.md`.

### Versions and Compatibility
- Expo SDK: `~51.0.0`
- React Native: `0.76.x` (Expo-managed)
- TypeScript: `~5.3.x`
- Never upgrade without updating `versions.md` and `package.json` together.
- If APIs change, add a migration doc under `docs/migrations/`.

### Installing Dependencies
- Prefer `expo install` for any package that has native modules to ensure Expo-compatible versions.
- Web-only or pure JS libs can use `npm install`, but verify they dont require native modules.
- Project-standard libs (match versions in `versions.md`):
  - NativeWind: `npm install nativewind tailwindcss`
  - Zustand: `npm install zustand`
  - React Query (v5): `npm install @tanstack/react-query`
  - Supabase: `npm install @supabase/supabase-js`
  - i18n: `npm install react-i18next i18next react-native-localize`
  - Audio: `expo install expo-av`
  - Sentry: `npx @sentry/wizard -i reactNative -p ios android`

### Expo Router and Navigation
- Use file-based routing under `app/`.
- Define stacks/tabs in `_layout.tsx` files.
- Prefer `router.push/back/replace` from `expo-router` over other nav libs.
- Hide headers at the nearest layout for custom UI: `options: { headerShown: false }`.
- Use `presentation` options when needed (e.g., `fullScreenModal`).
- Do not mix multiple navigation frameworks.

### Project Structure
- Follow `folders.md`:
  - `app/` → Expo Router screens & layouts
  - `src/components/`, `src/components/ui/` → reusable UI & primitives
  - `src/store/` → Zustand stores
  - `src/api/` → Supabase API by domain
  - `src/config/` → config (supabase, queryClient, audio, db)
  - `src/locales/` → i18n JSON files
  - `src/types/` → global TS types
  - `src/utils/` → utilities
- Use absolute imports `@/*` (configure `tsconfig.json` paths). Avoid `../../..` when possible.

### Styling (NativeWind)
- Use `className` utilities as the primary styling method.
- Keep a clean utility-first approach; avoid mixing with `style` unless necessary.
- Support dark mode with `useColorScheme` and `dark:` variants.
- Maintain global theme in `tailwind.config.js`.

### State and Data
- Client state: Zustand (see `state-zustand.md`). Type state strictly.
- Server state: React Query v5 (see `fetching-react-query.md`). Use `@/config/queryClient`.
- Backend: Supabase v2 (see `data-supabase.md`). Keys/config in `@/config/supabase`.

### Internationalization (i18n)
- Use `react-i18next`; wrap app with provider.
- Store keys in `src/locales` and avoid hardcoding user-facing strings.
- Organize keys by feature (e.g., `auth.login.title`).
- Support RTL for Arabic/Urdu via `I18nManager`.

### Permissions and App Config
- Request only necessary permissions and document them.
- Manage permissions via `app.json`/`app.config.*` when required by a module.
- For audio (record/playback), follow `expo-av.md` for permissions and lifecycle.

### Environment and Secrets
- Never hardcode secrets. Use app config, environment variables, or Expo runtime variables.
- Do not commit secrets to VCS.

### Build, Distribution, and OTA
- Use EAS for builds/submit/updates.
- OTA updates:
  - Only ship JS/asset changes compatible with the current runtime.
  - Test on a staging channel before promoting.
- Keep versioning and release notes clear.

### Debugging and DX
- Use Expo Dev Menu and Metro logs.
- Clear cache on config/dependency changes: `expo start -c`.
- Add meaningful logs and error boundaries where appropriate.

### Testing and Quality
- Functional, typed, and declarative components; avoid classes.
- TypeScript in strict mode; avoid `any`.
- When adding new libraries, include a minimal working example in the PR.

### Do Nots
- Do not install native modules requiring custom native code without confirming Expo support.
- Do not bypass `expo install` for RN packages that need native binaries.
- Do not mix navigation frameworks.

## Audio Handling (Expo AV)

- Use `expo-av` for recording and playback.
- Encapsulate logic in hooks (`useAudioRecorder`, `useAudioPlayer`).
- Request microphone permission before recording.
- Save recordings temporarily; upload to Supabase Storage.
- Store only metadata (file path, duration).
- Clean up sounds with `unloadAsync`.
- Use React Query mutations for uploads.
- Keep audio constants in `src/config/audio.ts`.
- Show user feedback (waveform, timer).

## Dependency & Configuration Rules

- **Always install and configure dependencies before use.**
- Use `expo install` whenever possible to ensure Expo-compatible versions.
- Examples:
  - NativeWind → `npm install nativewind tailwindcss`
  - Zustand → `npm install zustand`
  - React Query → `npm install @tanstack/react-query`
  - Supabase → `npm install @supabase/supabase-js`
  - i18n → `npm install react-i18next i18next react-native-localize`
  - Sentry → `npx @sentry/wizard -i reactNative -p ios android`

- **Run setup commands**:
  - Tailwind: `npx tailwindcss init`
  - Restart bundler: `expo start -c`

- **Do not commit code depending on a library that isnt fully set up.**
- PRs introducing new libraries must include a working example.

## Versions (Pinned)

- Expo SDK → ~51.0.0
- React Native → 0.76.x (Expo-managed)
- TypeScript → ~5.3.x
- NativeWind → ^4.0.36
- Tailwind CSS → ^3.4.1
- Zustand → ^4.5.2
- @tanstack/react-query → ^5.36.0
- @supabase/supabase-js → ^2.44.0
- react-i18next → ^13.2.2
- i18next → ^23.10.1
- expo-av → ~13.10.0
- sentry-expo → ^7.0.0

Rules for versions:

- Never upgrade dependencies without updating versions.md.

## Data Layer (Supabase)

- Initialize client in `src/config/supabase.ts`.
- Put queries/mutations in `src/api/*`.
- Never call Supabase directly from components.
- Use React Query for fetching, caching, syncing.
- Always type responses with Supabase types.
- Organize API by domain (`auth.ts`, `babies.ts`, `cries.ts`).
- Wrap calls in try/catch and log errors to Sentry.
- Use descriptive query keys (`["babies", userId]`).
- Store large files in Supabase Storage, only metadata in Postgres.
- Export table/column constants from `src/config/db.ts`.
