import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            reporter: ['text', 'json', 'html'],
        },
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/setup_test-env.ts'
        ],
        setupFiles: ['./src/auth/_test_/setup_test-env.ts'],
        testTimeout: 10000,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});