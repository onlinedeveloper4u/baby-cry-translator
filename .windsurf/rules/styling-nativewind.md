---
trigger: always_on
---

# 🎨 Styling & UI (NativeWind)

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