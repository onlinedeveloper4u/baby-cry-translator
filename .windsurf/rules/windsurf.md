---
trigger: always_on
---

🎯 Purpose

These rules define how to use Windsurf AI (swe-1) in this project to keep completions consistent and aligned with our architecture.

⚡ Usage Guidelines

Always reference project rules

Pin .windsurf/rules/*.md (e.g., styling-nativewind.md, state-zustand.md, typescript.md).

Mention them explicitly in prompts if AI is ignoring conventions.

Use swe-1 for:

Bug fixes

Writing tests

Refactoring within a single file

Implementing isolated features that follow existing patterns

Use GPT-4 / GPT-5 for:

Cross-file refactors

Large architectural changes

Complex documentation updates

Always re-index project

Run Rebuild Index after adding or renaming files.

Stick to versions below

Never let AI suggest APIs for newer versions unless we’ve explicitly upgraded.

If AI proposes unknown syntax → check package.json first.

Prompting conventions

Explicitly say:

“Apply changes in src/hooks/useAudioRecorder.ts expo-av.md.”

This keeps AI scoped and avoids rewriting unrelated code.