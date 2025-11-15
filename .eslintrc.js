module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-multi-spaces': [
      'error',
      { "ignoreEOLComments": true },
    ],
    'quote-props': 'warn',
    'linebreak-style': 'warn',
  },
};
