# FlinkDink Native App

A clean starter for a toddler flashcard app using Expo and React Native.

## Troubleshooting

### "Component auth has not been registered yet"

If you encounter a runtime error stating that the `auth` component has not been
registered when launching the native build, ensure that the `index.js` file
registers both the `main` and `auth` entry points. The repository now includes a
compatibility helper to avoid this issue. After updating `index.js`, run
`expo start -c` or rebuild the native project to clear any stale caches that may
cause the old entry point configuration to persist.
