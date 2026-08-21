import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    plugins: {
      '@next/next': nextPlugin,
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
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

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. React -> Next.js -> Node -> third-party
            ['^react(?:-dom)?(?:$|/)', '^next(?:$|/)', '^\\u0000(?!@/|\\.)', '^node:', '^@?\\w'],

            // 2. Project alias imports: @/...
            ['^\\u0000@/', '^@/'],

            // 3. Relative imports: ../../, ../, ./
            ['^\\u0000\\.', '^\\.'],
          ],
        },
      ],

      '@typescript-eslint/no-unused-vars': 'warn',
      'react/react-in-jsx-scope': 'off',
      'no-console': 'warn',
    },
  },

  prettierConfig,

  {
    ignores: ['.next/*', 'node_modules/*', 'dist/*'],
  },
);
