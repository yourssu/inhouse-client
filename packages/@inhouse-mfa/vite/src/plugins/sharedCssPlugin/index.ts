import type { Plugin } from 'vite';

import { partitionCss } from './partitionCss';

const screenQuery = '?mfa-screen';
const sharedQuery = '?mfa-shared';
const wrapperPrefix = '\0mfa-css:';

export const sharedCssPlugin = (sharedCSS: readonly string[], workspace: string): Plugin => {
  let root = '';
  const wrappers = new Map<string, string>();

  return {
    name: 'mfa-shared-css',
    enforce: 'pre',
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { name: 'mfa-standalone', content: workspace },
          injectTo: 'head-prepend',
        },
      ];
    },
    resolveId: {
      filter: { id: /\.css$/ },
      async handler(source, importer) {
        if (
          !sharedCSS.length ||
          !importer ||
          !source.endsWith('.css') ||
          importer.split('?')[0].endsWith('.css')
        ) {
          return;
        }
        const resolved = await this.resolve(source, importer, { skipSelf: true });
        if (!resolved || resolved.external || !resolved.id.startsWith(`${root}/`)) {
          return;
        }
        const id = `${wrapperPrefix}${encodeURIComponent(resolved.id)}.js`;
        wrappers.set(id, resolved.id);
        return id;
      },
    },
    load: {
      filter: { id: [/\0mfa-css:/, /\?mfa-(screen|shared)$/] },
      async handler(id) {
        const file = wrappers.get(id);
        if (file) {
          this.addWatchFile(file);
          const cssModule = file.endsWith('.module.css');
          return [
            cssModule
              ? `import classes from ${JSON.stringify(file + screenQuery)}; export default classes;`
              : `import ${JSON.stringify(file + screenQuery)};`,
            `if (typeof document !== 'undefined' && document.querySelector('meta[name="mfa-standalone"]')?.getAttribute('content') === ${JSON.stringify(workspace)}) {`,
            `  await import(${JSON.stringify(file + sharedQuery)});`,
            '}',
          ].join('\n');
        }
        const isShared = id.endsWith(sharedQuery);
        if (!isShared && !id.endsWith(screenQuery)) {
          return;
        }
        const filename = id.slice(0, id.indexOf('?'));
        this.addWatchFile(filename);
        const css = await partitionCss(filename, sharedCSS, (file) => this.addWatchFile(file));
        return isShared ? css.shared : css.screen;
      },
    },
  };
};
