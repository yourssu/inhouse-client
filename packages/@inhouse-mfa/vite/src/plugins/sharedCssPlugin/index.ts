import type { Plugin } from 'vite';

import path from 'node:path';

import { partitionCss } from './partitionCss';

const screenQuery = 'mfa-screen';

export const sharedCssPlugin = (sharedCSS: readonly string[]): Plugin => {
  let root = '';
  let sharedFiles: Promise<Set<string>> | undefined;
  const dependencies = new Map<string, string[]>();
  const excludedFiles = new Set<string>();

  return {
    name: 'mfa-shared-css',
    enforce: 'pre',
    configResolved(config) {
      root = config.root;
      sharedFiles = undefined;
      excludedFiles.clear();
      dependencies.clear();
    },
    resolveId: {
      filter: { id: /\.css(?:\?.*)?$/ },
      async handler(source, importer) {
        const [filename, query = ''] = source.split('?');

        if (
          !sharedCSS.length ||
          !importer ||
          !filename.endsWith('.css') ||
          new URLSearchParams(query).has(screenQuery) ||
          importer.split('?')[0].endsWith('.css')
        ) {
          return;
        }

        const resolved = await this.resolve(source, importer, { skipSelf: true });

        if (!resolved || resolved.external) {
          return;
        }

        sharedFiles ??= Promise.all(
          sharedCSS.map((css) =>
            this.resolve(css, path.join(root, 'src/styles/index.css'), { skipSelf: true }),
          ),
        ).then((files) => new Set(files.flatMap((file) => (file ? [file.id.split('?')[0]] : []))));

        const resolvedFile = resolved.id.split('?')[0];
        const excluded = sharedCSS.includes(filename) || (await sharedFiles).has(resolvedFile);

        if (!excluded && !resolvedFile.startsWith(`${root}/`)) {
          return;
        }

        if (new URLSearchParams(query).has('raw') || new URLSearchParams(query).has('url')) {
          this.error(
            '[mfa] Import remote styles as CSS modules or with ?inline, not ?raw or ?url.',
          );
        }

        if (excluded) {
          excludedFiles.add(resolvedFile);
        }

        return {
          ...resolved,
          id: `${resolved.id}${resolved.id.includes('?') ? '&' : '?'}${screenQuery}`,
        };
      },
    },
    load: {
      filter: { id: /[?&]mfa-screen$/ },
      async handler(id) {
        const filename = id.slice(0, id.indexOf('?'));
        const files = [filename];
        const css = excludedFiles.has(filename)
          ? ''
          : await partitionCss(filename, sharedCSS, (file) => files.push(file));
        dependencies.set(id, files);

        return css;
      },
    },
    transform: {
      filter: { id: /[?&]mfa-screen$/ },
      handler(_code, id) {
        // Vite attaches CSS dependency edges during transform, after creating the module node.
        dependencies.get(id)?.forEach((file) => this.addWatchFile(file));
      },
    },
  };
};
