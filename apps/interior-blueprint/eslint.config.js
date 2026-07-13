import workspaceReactEslintConfig from '@yourssu-inhouse/eslint-config/react';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/*.gen.*']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [workspaceReactEslintConfig, reactRefresh.configs.vite],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          extraHOCs: ['createFileRoute', 'createRootRoute', 'createLazyFileRoute'],
        },
      ],
    },
  },
]);
