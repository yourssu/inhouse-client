import type { Plugin } from 'vite';

import { parseSync, types as t, traverse } from '@babel/core';
import MagicString from 'magic-string';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const remoteHmrPlugin = (): Plugin => {
  let routesDirectory = '';
  let routeTreeFile = '';
  let routeTree = '';

  return {
    name: 'mfa-remote-route-hmr',
    apply: 'serve',
    enforce: 'post',
    configResolved(config) {
      routesDirectory = path.join(config.root, 'src/routes');
      routeTreeFile = path.join(config.root, 'src/routeTree.gen.ts');
    },
    async configureServer() {
      routeTree = await readFile(routeTreeFile, 'utf8').catch(() => '');
    },
    async hotUpdate({ file, read, type }) {
      if (this.environment.name !== 'client') {
        return;
      }

      if (
        type === 'delete' &&
        file.startsWith(`${routesDirectory}/`) &&
        /^~.*\.[cm]?[jt]sx?$/.test(path.basename(file))
      ) {
        return [];
      }

      if (file !== routeTreeFile) {
        return;
      }

      const next = await read();
      if (next === routeTree) {
        return;
      }

      routeTree = next;
      // The shell grafts route objects once. Structural changes need a fresh graft;
      // ordinary route option/component edits keep TanStack's existing HMR.
      this.environment.hot.send({ type: 'full-reload' });
      return [];
    },
    transform(code, id) {
      const filename = id.split('?')[0];
      const routeFile =
        path.dirname(filename) === routesDirectory
          ? path.basename(filename).replace(/\.[cm]?[jt]sx?$/, '')
          : undefined;
      const root = routeFile === '~__root';
      const auth = routeFile === '~_auth';

      if ((!root && !auth) || id.includes('?')) {
        return;
      }

      const ast = parseSync(code, {
        filename,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ['typescript', 'jsx'] },
      });
      const result = new MagicString(code);
      let replaced = false;

      if (ast) {
        traverse(ast, {
          IfStatement(statement) {
            if (!statement.parentPath.isProgram()) {
              return;
            }

            let routeHmr = false;
            statement.traverse({
              VariableDeclarator(declaration) {
                if (t.isIdentifier(declaration.node.id, { name: 'handleRouteUpdate' })) {
                  routeHmr = true;
                }
              },
            });

            if (routeHmr && statement.node.start != null && statement.node.end != null) {
              result.remove(statement.node.start, statement.node.end);
              replaced = true;
            }
          },
        });
      }

      if (!replaced) {
        return;
      }

      result.append('\nif (import.meta.hot) import.meta.hot.accept();\n');

      return { code: result.toString(), map: result.generateMap({ hires: true, source: id }) };
    },
  };
};
