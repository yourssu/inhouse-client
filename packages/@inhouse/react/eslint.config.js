import workspaceBaseEslintConfig from '@yourssu-inhouse/eslint-config/react';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.turbo']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [workspaceBaseEslintConfig],
  },
]);
