import type { Plugin } from 'vite';

import MagicString from 'magic-string';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const remoteContractPlugin = (name = 'remote'): Plugin => {
  let root = '';
  let development = false;
  let globalPath = '';
  const virtualGlobal = 'virtual:inhouse-mfa-global';
  const resolvedGlobal = `\0${virtualGlobal}`;
  const runtime = fileURLToPath(import.meta.resolve('@inhouse-mfa/core'));

  return {
    name: 'mfa-remote-contract',
    enforce: 'pre',
    configResolved(config) {
      root = config.root;
      development = config.command === 'serve';
    },
    resolveId(id) {
      if (id === virtualGlobal) {
        return resolvedGlobal;
      }
    },
    load(id) {
      if (id !== resolvedGlobal) {
        return;
      }

      return `
import * as initialGlobal from ${JSON.stringify(globalPath)};
import { REMOTE_GLOBAL_UPDATE_EVENT } from ${JSON.stringify(runtime)};
const state = import.meta.hot?.data.mfaGlobal ?? { module: initialGlobal };
if (import.meta.hot) {
  import.meta.hot.data.mfaGlobal = state;
  import.meta.hot.accept(${JSON.stringify(globalPath)}, (global) => {
    if (!global) return;
    state.module = global;
    window.dispatchEvent(new CustomEvent(REMOTE_GLOBAL_UPDATE_EVENT, {
      detail: { name: ${JSON.stringify(name)}, global },
    }));
  });
}
export const getGlobal = () => state.module;
`;
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
          globalPath = path.join(root, 'inhouse-mfa', global);
          this.addWatchFile(globalPath);
          imports.push(
            development
              ? `export const global = () => import('${virtualGlobal}').then((module) => module.getGlobal());`
              : `export const global = () => import('./${global}');`,
          );
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
