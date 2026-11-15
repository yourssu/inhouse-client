import type { Plugin } from 'vite';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_PLUGIN_ENTRY, REMOTE_CONTRACT_ID } from '../core/config';

export const remoteContractPlugin = (
  name = 'remote',
  pluginEntry: string = DEFAULT_PLUGIN_ENTRY,
): Plugin => {
  const resolvedContract = `\0${REMOTE_CONTRACT_ID}`;
  const runtime = fileURLToPath(import.meta.resolve('@inhouse-mfa/core'));
  let entry = '';
  let stylesheet = '';
  let development = false;

  return {
    name: 'mfa-remote-contract',
    enforce: 'pre',
    configResolved(config) {
      entry = path.resolve(config.root, pluginEntry);
      stylesheet = path.join(config.root, 'src/styles/index.css');
      development = config.command === 'serve';
      if (!fs.statSync(entry, { throwIfNoEntry: false })?.isFile()) {
        throw new Error(`[mfa-vite] '${name}' plugin entry not found: ${entry}`);
      }
    },
    resolveId(id) {
      if (id === REMOTE_CONTRACT_ID || id === resolvedContract) {
        return resolvedContract;
      }
    },
    load(id) {
      if (id !== resolvedContract) {
        return;
      }

      this.addWatchFile(entry);
      const styles = fs.existsSync(stylesheet);
      if (styles) {
        this.addWatchFile(stylesheet);
      }

      return `
import initialPlugin from ${JSON.stringify(entry)};
${styles ? `import ${JSON.stringify(stylesheet)};` : ''}
${development ? `import { REMOTE_GLOBAL_UPDATE_EVENT } from ${JSON.stringify(runtime)};` : ''}
if (!initialPlugin?.routeTree) {
  throw new Error(${JSON.stringify(`[mfa-vite] '${name}' must default-export a remote plugin with routeTree: ${entry}`)});
}
const state = ${development ? 'import.meta.hot?.data.mfaPlugin ?? ' : ''}{ definition: initialPlugin };
export const routeTree = state.definition.routeTree;
export const global = state.definition.global ? async () => state.definition.global : undefined;
${
  development
    ? `
if (import.meta.hot) {
  import.meta.hot.data.mfaPlugin = state;
  import.meta.hot.accept(${JSON.stringify(entry)}, (module) => {
    const next = module?.default;
    if (!next?.routeTree || next.routeTree !== routeTree || Boolean(next.global) !== Boolean(state.definition.global)) {
      import.meta.hot.invalidate('Remote plugin structure changed');
      return;
    }
    state.definition = next;
    if (next.global) {
      window.dispatchEvent(new CustomEvent(REMOTE_GLOBAL_UPDATE_EVENT, {
        detail: { name: ${JSON.stringify(name)}, global: next.global },
      }));
    }
  });
}
`
    : ''
}
`;
    },
  };
};
