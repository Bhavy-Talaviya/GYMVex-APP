// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...(Array.isArray(expoConfig) ? expoConfig : [expoConfig]),
  {
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'backend/*'],
  },
];

