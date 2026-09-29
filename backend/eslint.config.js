import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

// Backend-only lint rules (Node globals, no React). Keeps the frontend's
// ESLint config at the project root untouched.
export default defineConfig([
  globalIgnores(['node_modules']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      // Allow unused args that start with _ (Express error handlers need all 4 params).
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
])
