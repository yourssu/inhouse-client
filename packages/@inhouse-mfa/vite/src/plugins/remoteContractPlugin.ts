import type { Plugin } from 'vite';

import MagicString from 'magic-string';
import fs from 'node:fs';
import path from 'node:path';

export const remoteContractPlugin = (): Plugin => {
  let root = '';

  return {
    name: 'mfa-remote-contract',
    enforce: 'pre',
    configResolved(config) {
      root = config.root;
    },
    transform: {
      filter: { id: /\/inhouse-mfa\/route\.ts$/ },
      handler(code, id) {
        if (id !== path.join(root, 'inhouse-mfa/route.ts')) {
          return;
        }

        const imports: string[] = [];
        const stylesheet = path.join(root, 'src/styles/index.css');
        if (fs.existsSync(stylesheet)) {
          this.addWatchFile(stylesheet);
          imports.push("import '../src/styles/index.css';");
        }

        const global = ['global.ts', 'global.tsx'].find((filename) =>
          fs.existsSync(path.join(root, 'inhouse-mfa', filename)),
        );
        if (global) {
          this.addWatchFile(path.join(root, 'inhouse-mfa', global));
          imports.push(`export * as global from './${global}';`);
        }

        if (!imports.length) {
          return;
        }

        const output = new MagicString(code).append(`\n${imports.join('\n')}`);
        return { code: output.toString(), map: output.generateMap({ hires: true }) };
      },
    },
  };
};
