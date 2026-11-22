import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
          setupFiles: ['./tests/setup/unit.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'int',
          environment: 'node',
          include: ['tests/int/**/*.test.ts'],
          setupFiles: ['./tests/setup/int.ts'],
          globalSetup: ['./tests/setup/int-global.ts'],
          // One Payload instance and one database: run integration files one after another.
          fileParallelism: false,
          testTimeout: 60_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
})
