// Lint rules: https://playwright.dev/docs/best-practices#lint-your-tests
import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'reports/', 'test-results/', 'data/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      // A missing `await` on a Playwright call is the most common cause of flaky tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Our tests record findings and continue (see src/findings/findings.ts), so they branch on
      // results on purpose instead of failing at the first problem.
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
      'playwright/expect-expect': 'off', // assertions run inside findings.check()
      'playwright/no-standalone-expect': 'off', // findings.check() is called from helper functions
      'playwright/valid-title': 'off', // test titles are page paths like "/about"
    },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly', fetch: 'readonly', URL: 'readonly' } },
  },
);
