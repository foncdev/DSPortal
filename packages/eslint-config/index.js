module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: '../../tsconfig.json',
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'import'],
    env: {
        node: true,
        es6: true,
    },
    rules: {
        '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'radix': 'error',
        'eqeqeq': ['error', 'always'],
        'curly': 'error',
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'warn',
        '@typescript-eslint/prefer-optional-chain': 'warn',
        'arrow-body-style': ['error', 'as-needed'],
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': ['error', 'always'],
        'sort-imports': ['warn', { ignoreDeclarationSort: true, ignoreMemberSort: false, allowSeparatedGroups: true }],
        'import/order': ['warn', { groups: ['builtin', 'external', 'internal'], 'newlines-between': 'always' }]
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.spec.ts'],
            rules: {
                'no-console': 'off',
                '@typescript-eslint/no-explicit-any': 'off'
            }
        }
    ],
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
        "**/setup_test-env.ts"
    ],
    settings: {
        react: { version: 'detect' },
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
            typescript: {
                alwaysTryTypes: true,
            },
        },
    }
};
