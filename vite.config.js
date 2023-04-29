/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    // include: ['tests/lucid.test.*', 'tests/mint-onchain-positive.test.*'],
    include: ['tests/new*.test.ts', ],
  },
});
