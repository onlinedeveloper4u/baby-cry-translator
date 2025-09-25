---
description: When need to fetch data from api, server etc.
alwaysApply: false
---
# 🔄 Data Fetching (React Query)

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
