module.exports = {
    projects: [
        '<rootDir>/packages/*/jest.config.js',
        '<rootDir>/lib/*/jest.config.js'
    ],
    collectCoverageFrom: [
        '**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/dist/**'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};