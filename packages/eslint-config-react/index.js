module.exports = {
    extends: [
        '@ds/eslint-config', // Base configuration
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended', // Add accessibility rules
    ],
    plugins: ['react', 'react-hooks', 'jsx-a11y'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off', // Since we're using TypeScript
        'react/display-name': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'jsx-a11y/anchor-is-valid': 'warn',
    },
};