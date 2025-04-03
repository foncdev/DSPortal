// Demo/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        deps: {
            inline: ['@ds/core', '@ds/utils']
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@ds/core': resolve(__dirname, '../packages/core/src'),
            '@ds/utils': resolve(__dirname, '../packages/utils/src')
        },
    },
});