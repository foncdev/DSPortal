module.exports = {
    extends: ['@ds/eslint-config-react'],
    parserOptions: {
        project: './tsconfig.json', // app 디렉토리 내의 tsconfig.json 파일 참조
        tsconfigRootDir: __dirname,  // 현재 디렉토리를 루트로 지정
    },
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
            },
        },
    },
};