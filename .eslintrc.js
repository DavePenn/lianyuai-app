module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'script',
    },
    rules: {
        indent: ['warn', 4],
        quotes: ['warn', 'single'],
        semi: ['warn', 'always'],
        'no-console': 'off',
    },
};
