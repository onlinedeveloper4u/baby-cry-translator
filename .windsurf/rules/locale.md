---
trigger: always_on
---

# 🌍 Internationalization (i18n)

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