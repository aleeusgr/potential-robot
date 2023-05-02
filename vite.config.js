/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['tests/new*.test.ts', ],
    // include: ['tests/*.test.ts', 'tests/*.test.js'],
  },
});
