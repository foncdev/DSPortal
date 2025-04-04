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
            name: 'core',
            fileName: (format) => `core.${format}.js`,
        },
        rollupOptions: {
            // 외부 라이브러리로 취급할 의존성
            external: [
                'react',
                'react-dom',
                '**/setup_test-env.ts',
                '**/**.test.ts'
            ],
            output: {
                // 전역 변수로 사용될 외부 라이브러리 지정
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
                // 코드 분할 비활성화
                inlineDynamicImports: true
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
            '@': resolve(__dirname, 'src'),
        },
    },
});