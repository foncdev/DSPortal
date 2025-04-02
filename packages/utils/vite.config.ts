import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'utils',
            fileName: (format) => `utils.${format}.js`,
        },
        rollupOptions: {
            // 외부 라이브러리로 취급할 의존성
            external: [],
            output: {
                // 전역 변수로 사용될 외부 라이브러리 지정
                globals: {},
            },
        },
        sourcemap: true,
        // 번들 최적화
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false,
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});