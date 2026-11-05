import type { ResolvedConfig } from 'vite';

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

import { cssResolverOptions } from './cssResolver';
import { isRemoteCssAssetSource, validateRemoteCssAssets } from './validateRemoteCssAssets';

const emptyCss = fileURLToPath(new URL('./empty.css', import.meta.url));
const compilerDirective =
  /^(?:theme|utility|custom-variant|variant|plugin|config|source|reference|tailwind|apply)$/;

const ignoreMissingFile = (error: unknown) => {
  if (
    error instanceof Error &&
    'code' in error &&
    (error.code === 'ENOENT' || error.code === 'ENOTDIR')
  ) {
    return;
  }

  throw error;
};

const collectPublicCssFiles = async (directory: string) => {
  const files = new Set<string>();
  const visited = new Set<string>();
  const visit = async (directory: string): Promise<void> => {
    const actual = await fs.realpath(directory).catch(ignoreMissingFile);

    if (!actual || visited.has(actual)) {
      return;
    }

    visited.add(actual);

    for (const entry of await fs.readdir(actual, { withFileTypes: true })) {
      const filename = path.join(actual, entry.name);
      const stat = entry.isSymbolicLink()
        ? await fs.stat(filename).catch(ignoreMissingFile)
        : entry;

      if (stat?.isDirectory()) {
        await visit(filename);
      } else if (stat?.isFile() && (filename.endsWith('.css') || entry.isSymbolicLink())) {
        const target = await fs.realpath(filename);

        if (filename.endsWith('.css') || target.endsWith('.css')) {
          files.add(target);
        }
      }
    }
  };

  await visit(directory);

  return files;
};

export const createRemoteCssPolicy = (config: ResolvedConfig, sharedCSS: readonly string[]) => {
  const nativeCreateResolver = config.createResolver.bind(config);
  const resolveShared = nativeCreateResolver(cssResolverOptions);
  let sharedFiles: Promise<Set<string>> | undefined;

  const validateSharedFile = async (filename: string, visited: Set<string>): Promise<void> => {
    if (visited.has(filename)) {
      return;
    }

    visited.add(filename);

    if (filename.endsWith('.module.css')) {
      throw new Error(`[mfa] sharedCSS must not contain CSS Modules: ${filename}`);
    }

    const css = postcss.parse(await fs.readFile(filename, 'utf8'), { from: filename });
    const imports: string[] = [];

    css.walkAtRules((rule) => {
      if (compilerDirective.test(rule.name)) {
        throw rule.error('[mfa] Keep Tailwind compiler definitions outside sharedCSS.');
      }

      if (rule.name === 'import') {
        const node = valueParser(rule.params).nodes[0];
        const source = node?.type === 'function' && node.value === 'url' ? node.nodes[0] : node;

        if (
          source &&
          (source.type === 'string' || source.type === 'word') &&
          !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(source.value)
        ) {
          imports.push(source.value);
        }
      }
    });

    for (const source of imports) {
      const resolved = await resolveShared(source, filename);

      if (!resolved) {
        throw new Error(`[mfa] Cannot resolve shared CSS import ${source} from ${filename}.`);
      }

      await validateSharedFile(await fs.realpath(resolved), visited);
    }
  };

  const getSharedFiles = () => {
    sharedFiles ??= Promise.all([
      config.publicDir && sharedCSS.length
        ? collectPublicCssFiles(config.publicDir)
        : new Set<string>(),
      Promise.all(
        sharedCSS.map(async (source) => {
          const resolved = await resolveShared(
            source,
            path.join(config.root, 'src/styles/index.css'),
          );

          if (!resolved || !resolved.endsWith('.css') || resolved.endsWith('.module.css')) {
            throw new Error(
              `[mfa] sharedCSS must resolve to output CSS, not a CSS Module: ${source}`,
            );
          }

          const filename = await fs.realpath(resolved);

          await validateSharedFile(filename, new Set());

          return filename;
        }),
      ),
    ])
      .then(([publicFiles, files]) => {
        if (files.some((filename) => publicFiles.has(filename))) {
          throw new Error('[mfa] sharedCSS must use source/package CSS, not copied public CSS.');
        }

        return new Set(files);
      })
      .catch((error: unknown) => {
        sharedFiles = undefined;
        throw error;
      });

    return sharedFiles;
  };

  const replace = async (id: string) => {
    const offset = id.indexOf('?');
    const filename = offset === -1 ? id : id.slice(0, offset);
    const suffix = offset === -1 ? '' : id.slice(offset);

    if (!filename.endsWith('.css') || !path.isAbsolute(filename)) {
      return id;
    }

    const files = await getSharedFiles();
    const actual = files.size ? await fs.realpath(filename).catch(ignoreMissingFile) : undefined;
    const shared = actual !== undefined && files.has(actual);
    const relative = path.relative(config.root, filename);
    const local = !relative.startsWith('..') && !path.isAbsolute(relative);
    const query = new URLSearchParams(suffix.slice(1));

    if ((shared || local) && (query.has('raw') || query.has('url'))) {
      throw new Error(
        '[mfa] Import remote styles as CSS modules or with ?inline, not ?raw or ?url.',
      );
    }

    if (shared || filename === emptyCss) {
      const replacement = `${emptyCss}${suffix}`;
      // Vite checks both the file and full ?inline ID when the package is outside root.
      for (const id of [emptyCss, replacement]) {
        if (!config.server.fs.allow.includes(id)) {
          config.server.fs.allow.push(id);
        }
      }

      return replacement;
    }

    if (isRemoteCssAssetSource(filename, config.root)) {
      const css = await fs.readFile(filename, 'utf8').catch(ignoreMissingFile);

      // A load hook may provide CSS for an absolute ID without a physical file.
      if (css !== undefined) {
        validateRemoteCssAssets(css, filename, config.root);
      }
    }

    return id;
  };

  return { nativeCreateResolver, replace, initialize: getSharedFiles };
};
