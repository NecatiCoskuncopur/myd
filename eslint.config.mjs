import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    // 1. Temel JS ve TS kuralları
    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
      // Hangi dosyalarda çalışacağını belirtiyoruz
      files: ['**/*.{ts,tsx,js,jsx}'],
      plugins: {
        '@next/next': nextPlugin,
        'prettier': prettierPlugin,
      },
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
        'prettier/prettier': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',
        'react/react-in-jsx-scope': 'off',
        'no-console': 'warn',
      },
    },

    prettierConfig,
    {
      ignores: ['.next/*', 'node_modules/*', 'dist/*'],
    }
);