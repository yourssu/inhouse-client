import type { Plugin, ResolvedConfig } from 'vite';

import { traverse } from '@babel/core';
import MagicString from 'magic-string';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

import { parseClassSource } from './tailwindcssPrefix/utils/parseClassSource';

const publicModule = '@inhouse-mfa/vite/assets';
const virtualId = '\0inhouse-mfa:assets';
const publicRoot = '__INHOUSE_MFA_PUBLIC_ROOT__';
const externalUrl = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export const remoteAssetsPlugin = (): Plugin => {
  let config: ResolvedConfig;

  return {
    name: 'mfa-remote-assets',
    enforce: 'pre',
    config(options) {
      return {
        base: options.base ?? './',
        experimental: {
          renderBuiltUrl(filename, { hostId, hostType }) {
            if (hostType !== 'js') {
              return { relative: true };
            }

            const relative = path.posix.relative(path.posix.dirname(hostId), filename);
            return { runtime: `new URL(${JSON.stringify(relative)}, import.meta.url).href` };
          },
        },
      };
    },
    configResolved(resolved) {
      config = resolved;
    },
    resolveId: {
      filter: { id: new RegExp(`^${publicModule}$`) },
      handler(id) {
        return id === publicModule ? virtualId : undefined;
      },
    },
    load: {
      filter: { id: /^\0inhouse-mfa:assets$/ },
      handler() {
        const base = config.command === 'build' ? publicRoot : config.base;
        return `const base = ${JSON.stringify(base)};
const root = new URL(base, import.meta.url);
export const publicAsset = (filename) => /^(?:[a-z][a-z\\d+.-]*:|\\/\\/)/i.test(filename)
  ? filename : new URL(filename.replace(/^\\/+/, ''), root).href;`;
      },
    },
    renderChunk(code, chunk) {
      const marker = JSON.stringify(publicRoot);
      const offset = code.indexOf(marker);

      if (offset === -1) {
        return;
      }

      const relative = path.posix.relative(path.posix.dirname(chunk.fileName), '.') || '.';
      const output = new MagicString(code);
      output.update(offset, offset + marker.length, JSON.stringify(`${relative}/`));
      return { code: output.toString(), map: output.generateMap({ hires: true }) };
    },
    transform: {
      filter: { id: /\.(?:css|[cm]?[jt]sx?)(?:\?.*)?$/ },
      handler(code, id) {
        const filename = id.split('?')[0];

        if (!filename.startsWith(`${config.root}/`) || filename.includes('/node_modules/')) {
          return;
        }

        if (filename.endsWith('.css')) {
          postcss.parse(code, { from: filename }).walkDecls((declaration) => {
            valueParser(declaration.value).walk((node) => {
              if (node.type !== 'function' || node.value !== 'url') {
                return;
              }

              const url = node.nodes.find(
                (entry) => entry.type === 'word' || entry.type === 'string',
              );
              if (url?.value.startsWith('/') && !externalUrl.test(url.value)) {
                throw declaration.error('Use a source-relative CSS url() for remote assets.');
              }
            });
          });
          return;
        }

        const ast = parseClassSource(code, filename);
        if (!ast || !config.publicDir) {
          return;
        }

        traverse(ast, {
          StringLiteral(node) {
            const value = node.node.value;
            if (!value.startsWith('/') || externalUrl.test(value)) {
              return;
            }

            if (
              node.parentPath.isCallExpression() &&
              node.parentPath.get('callee').referencesImport(publicModule, 'publicAsset')
            ) {
              return;
            }

            const publicFile = path.join(config.publicDir, value.split(/[?#]/)[0]);
            if (fs.existsSync(publicFile) && fs.statSync(publicFile).isFile()) {
              throw node.buildCodeFrameError(
                'Use publicAsset() for files in the remote public directory.',
              );
            }
          },
        });
      },
    },
  };
};
