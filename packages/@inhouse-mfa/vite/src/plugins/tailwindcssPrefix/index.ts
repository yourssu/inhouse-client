import type { Plugin, ResolvedConfig } from 'vite';

import { loadModule } from '@tailwindcss/node';
import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { __unstable__loadDesignSystem as loadDesignSystem } from 'tailwindcss';

import { createCssResolver } from '../../cssResolver';
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
  let config: ResolvedConfig;
  let mapper: Promise<ReturnType<typeof createClassMapper>> | undefined;
  const values = createClassValueResolver((filename) => fs.readFile(filename, 'utf8'));
  const sourceMappings = new Map<
    string,
    { classes: Map<string, string>; dependencies: Set<string> }
  >();

  const reloadDesignSystem = () => {
    const filename = path.join(root, 'src/styles/index.css');
    const resolve = createCssResolver(config);

    mapper = fs
      .readFile(filename, 'utf8')
      .then((css) =>
        loadDesignSystem(css, {
          base: path.dirname(filename),
          loadModule: (source, base) => loadModule(source, base, () => {}),
          async loadStylesheet(source, base) {
            const resolved = await resolve(source, path.join(base, 'index.css'));

            if (!resolved) {
              throw new Error(`[mfa] Cannot resolve stylesheet ${source} from ${base}.`);
            }

            return {
              path: resolved,
              base: path.dirname(resolved),
              content: await fs.readFile(resolved, 'utf8'),
            };
          },
        }),
      )
      .then((system) =>
        createClassMapper(
          prefix,
          (value) =>
            /^(?:group|peer)(?:\/.+)?$/.test(value) || system.candidatesToCss([value])[0] !== null,
        ),
      )
      .catch((error: unknown) => {
        mapper = undefined;
        throw error;
      });

    return mapper;
  };

  const sourcePlugin: Plugin = {
    name: 'mfa-tailwind-prefix-source',
    enforce: 'pre',
    configResolved(resolved) {
      config = resolved;
      root = resolved.root;
      mapper = undefined;
    },

    async hotUpdate({ file, modules, timestamp }) {
      const stylesheetChanged = file.endsWith('.css');
      const importedValueChanged = values.invalidate(file);

      if (!stylesheetChanged && !importedValueChanged) {
        return;
      }

      if (stylesheetChanged) {
        await reloadDesignSystem();
      }

      const classes = await (mapper ?? reloadDesignSystem());
      const affected = [...sourceMappings].flatMap(([id, source]) => {
        const mappingChanged =
          stylesheetChanged &&
          [...source.classes].some(([value, mapped]) => classes.mapClassName(value) !== mapped);

        if (!mappingChanged && !source.dependencies.has(file)) {
          return [];
        }

        const module = this.environment.moduleGraph.getModuleById(id);
        return module ? [module] : [];
      });

      if (affected.length === 0) {
        return;
      }

      const updates = new Set([
        ...modules,
        ...(this.environment.moduleGraph.getModulesByFile(file) ?? []),
        ...affected,
      ]);

      for (const module of updates) {
        this.environment.moduleGraph.invalidateModule(module, new Set(), timestamp, true);
      }

      return [...updates];
    },

    transform: {
      filter: { id: /\.[cm]?[jt]sx?(?:\?.*)?$/ },
      async handler(code, id) {
        const filename = id.split('?')[0];

        if (!filename.startsWith(`${root}/src/`)) {
          return;
        }

        const classes = await (mapper ?? reloadDesignSystem());
        const mappings = new Map<string, string>();
        const dependencies = new Set<string>();
        const mapClassList = (value: string) =>
          value.replace(/\S+/g, (candidate) => {
            const mapped = classes.mapClassName(candidate);
            mappings.set(candidate, mapped);
            return mapped;
          });
        const result = await namespaceSource(code, filename, mapClassList, (valuePath) =>
          values.resolveValue(valuePath, filename, async (source, importer) => {
            const resolved = await this.resolve(source, importer);

            if (!resolved || resolved.external || !/\.[cm]?[jt]sx?$/.test(resolved.id)) {
              return;
            }

            this.addWatchFile(resolved.id);
            dependencies.add(resolved.id);
            return resolved.id;
          }),
        );

        sourceMappings.set(id, { classes: mappings, dependencies });

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
        if (!id.startsWith(`${root}/`)) {
          return;
        }

        const classes = await (mapper ?? reloadDesignSystem());
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
