# Baby Cry Translator 👶🔊

A React Native application built with Expo that helps parents understand their baby's needs by analyzing their cries.

## Project Structure

```
├── app/                     # Expo Router screens (route-based)
│   ├── _layout.tsx          # Root layout component
│   ├── index.tsx            # Home screen
│   └── (tabs)/              # Tab navigation
│       ├── home.tsx
│       ├── profile.tsx
│       └── settings.tsx
│
├── src/
│   ├── api/                 # API requests and services
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Basic UI elements (buttons, inputs, etc.)
│   │   └── layout/          # Layout components (headers, footers, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── store/               # State management (Zustand/Redux/Context)
│   ├── utils/               # Helper functions, formatters, validators
│   ├── config/              # App configurations (theme, constants, etc.)
│   └── types/               # TypeScript type definitions
│
├── assets/                  # Static assets
│   ├── fonts/               # Custom fonts
│   ├── images/              # Image assets
│   └── icons/               # App icons
│
├── .gitignore
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd baby-cry-translator
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

4. Run on your device/emulator
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go (Android) or Camera (iOS)

## 🛠 Development

### Code Style
- Follow the [React Native Style Guide](https://reactnative.dev/docs/style)
- Use TypeScript for type safety
- Keep components small and focused on a single responsibility

### Import Aliases
Use the `@/` alias for imports from the `src` directory:

```typescript
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
