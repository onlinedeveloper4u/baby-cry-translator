---
trigger: model_decision
description: When working with audio playback, record etc.
---

# 🎤 Audio Handling (Expo AV)

- Use `expo-av` for recording and playback.
- Encapsulate logic in hooks (`useAudioRecorder`, `useAudioPlayer`).
- Request microphone permission before recording.
- Save recordings temporarily; upload to Supabase Storage.
- Store only metadata (file path, duration).
- Clean up sounds with `unloadAsync`.
- Use React Query mutations for uploads.
- Keep audio constants in `src/config/audio.ts`.
- Show user feedback (waveform, timer).