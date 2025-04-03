import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@ds/core': resolve(__dirname, '../packages/core/src'),
            '@ds/utils': resolve(__dirname, '../packages/utils/src')
        },
    },
    // 개발 서버 설정
    server: {
        port: 2000,
        open: true,
        cors: true,
        hmr: {
            overlay: true,
        },
    },
    // 빌드 설정
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    vendor: ['@ds/core', '@ds/utils']
                }
            }
        },
        target: 'es2020',
        minify: 'terser',
    },
    // 최적화 설정
    optimizeDeps: {
        include: ['react', 'react-dom'],
        exclude: ['@ds/core', '@ds/utils']
    },
    // 환경 변수 설정
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:8080/api')
    },
    // CSS 처리 설정
    css: {
        devSourcemap: true,
        modules: {
            localsConvention: 'camelCase'
        }
    },
    // 정적 자산 처리
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif']
})
