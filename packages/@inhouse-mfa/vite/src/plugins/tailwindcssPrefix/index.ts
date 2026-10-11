import type { Plugin } from 'vite';

import { __unstable__loadDesignSystem as loadDesignSystem } from '@tailwindcss/node';
import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

import { createClassMapper } from './utils/createClassMapper';
import { createClassValueResolver } from './utils/createClassValueResolver';
import { namespaceSource } from './utils/namespaceSource';

interface TailwindcssPrefixOptions {
  prefix: string;
}

export const tailwindcssPrefix = ({ prefix }: TailwindcssPrefixOptions): Plugin[] => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(prefix)) {
    throw new Error('[mfa-vite] Tailwind namespace prefix must be a lowercase name.');
  }

  let root = '';
  let mapper: Promise<ReturnType<typeof createClassMapper>>;
  const values = createClassValueResolver((filename) => fs.readFile(filename, 'utf8'));

  const reloadDesignSystem = () => {
    const filename = path.join(root, 'src/styles/index.css');

    mapper = fs
      .readFile(filename, 'utf8')
      .then((css) => loadDesignSystem(css, { base: path.dirname(filename) }))
      .then((system) =>
        createClassMapper(
          prefix,
          (value) =>
            /^(?:group|peer)(?:\/.+)?$/.test(value) || system.candidatesToCss([value])[0] !== null,
        ),
      );

    return mapper;
  };

  const sourcePlugin: Plugin = {
    name: 'mfa-tailwind-prefix-source',
    enforce: 'pre',
    async configResolved(config) {
      root = config.root;

      await reloadDesignSystem();
    },

    async hotUpdate({ file, server }) {
      const stylesheetChanged = file.endsWith('.css');
      const importedValueChanged = values.invalidate(file);

      if (!stylesheetChanged && !importedValueChanged) {
        return;
      }

      if (stylesheetChanged) {
        await reloadDesignSystem();
      }

      server.moduleGraph.invalidateAll();
      server.ws.send({ type: 'full-reload' });
    },

    transform: {
      filter: { id: /\.[cm]?[jt]sx?(?:\?.*)?$/ },
      async handler(code, id) {
        const filename = id.split('?')[0];

        if (!filename.startsWith(`${root}/src/`)) {
          return;
        }

        const classes = await mapper;
        const result = await namespaceSource(code, filename, classes.mapClassList, (valuePath) =>
          values.resolveValue(valuePath, filename, async (source, importer) => {
            const resolved = await this.resolve(source, importer);

            if (!resolved || resolved.external || !/\.[cm]?[jt]sx?$/.test(resolved.id)) {
              return;
            }

            this.addWatchFile(resolved.id);
            return resolved.id;
          }),
        );

        return result?.code ? { code: result.code, map: result.map } : undefined;
      },
    },
  };

  const cssPlugin: Plugin = {
    name: 'mfa-tailwind-prefix-css',
    enforce: 'pre',
    transform: {
      filter: { id: /\.css(?:\?.*)?$/ },
      async handler(code, id) {
        if (!id.startsWith(`${root}/`) || id.endsWith('?mfa-shared')) {
          return;
        }

        const classes = await mapper;
        const css = postcss.parse(code, { from: id });

        css.walkAtRules('layer', (layer) => {
          if (layer.params !== 'utilities' || layer.parent?.type !== 'root') {
            return;
          }

          layer.walkRules((rule) => {
            rule.selector = selectorParser((selectors) => {
              selectors.walkClasses((node) => {
                node.value = classes.mapClassName(node.value);
              });
            }).processSync(rule.selector);
          });
        });

        const result = css.toResult({ map: { inline: false, annotation: false } });

        return { code: result.css, map: result.map?.toString() };
      },
    },
  };

  return [sourcePlugin, cssPlugin];
};
