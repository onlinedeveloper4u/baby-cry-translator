---
description: For error monitoring
alwaysApply: false
---
# 🛡 Error Monitoring (Sentry)

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
