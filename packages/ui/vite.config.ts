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
            name: 'ui',
            fileName: (format) => `ui.${format}.js`,
        },
        rollupOptions: {
            // Externalize deps that shouldn't be bundled
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime'
            ],
            output: {
                // Global variables to use in UMD build for externalized deps
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime'
                },
                // Generate CSS files
                assetFileNames: (assetInfo) => {
                    return assetInfo.name === 'style.css' ? 'styles/index.css' : 'assets/[name]-[hash][extname]';
                }
            },
        },
        sourcemap: true,
        // Bundle optimization
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false,
            },
        },
        // Extract CSS into separate files
        cssCodeSplit: true,
    },
    css: {
        // Generate CSS sourcemaps
        devSourcemap: true,
        // Process SCSS
        preprocessorOptions: {
            scss: {
                quietDeps: true,
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});