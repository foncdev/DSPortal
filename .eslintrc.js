module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier'
    ],
    settings: {
        react: {
            version: 'detect'
        },
        'import/resolver': {
            typescript: {
                // 프로젝트 경로들을 포함합니다
                project: ['tsconfig.json', 'packages/*/tsconfig.json', 'Demo/tsconfig.json', 'app/tsconfig.json'],
            },
        },
    },
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true
    },
    rules: {
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn'
    },
    ignorePatterns: [
        'dist',
        'node_modules',
        '*.js',
        '**/*.config.js',
        '**/*.config.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.d.ts'
    ],
};