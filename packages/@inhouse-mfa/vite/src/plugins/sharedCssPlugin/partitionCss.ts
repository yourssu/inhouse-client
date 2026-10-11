import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssValueParser from 'postcss-value-parser';

const importSpecifier = (params: postcssValueParser.ParsedValue) => {
  const first = params.nodes[0];
  if (first?.type === 'string') {
    return first;
  }
  if (first?.type === 'function' && first.value === 'url') {
    return first.nodes.find((node) => node.type === 'string' || node.type === 'word');
  }
};

const relativeUrl = (value: string) => !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(value);

const rebaseUrl = (value: string, source: string, target: string): string =>
  `./${path.relative(path.dirname(target), path.resolve(path.dirname(source), value)).replaceAll('\\', '/')}`;

export const partitionCss = async (
  filename: string,
  sharedCSS: readonly string[],
  watch: (file: string) => void,
) => {
  filename = await fs.realpath(filename);

  const source = await fs.readFile(filename, 'utf8');

  const checkLocalImports = {
    postcssPlugin: 'mfa-local-import-contract',
    Once(root: import('postcss').Root) {
      root.walkAtRules('import', (rule) => {
        const params = postcssValueParser(rule.params);
        const specifier = importSpecifier(params);
        if (
          specifier?.value.startsWith('.') &&
          !sharedCSS.includes(specifier.value) &&
          params.nodes.filter((node) => node.type !== 'space').length > 1
        ) {
          throw rule.error(
            'Put layer/supports/media on shared package imports directly; qualified local CSS imports cannot be partitioned safely.',
          );
        }
      });
    },
  };

  const result = await postcss([
    checkLocalImports,
    postcssImport({
      filter: (id) => id.startsWith('.') && !sharedCSS.includes(id),
      plugins: [checkLocalImports],
    }),
  ]).process(source, { from: filename, map: false });

  for (const warning of result.warnings()) {
    throw warning.node?.error(warning.text) ?? new Error(warning.text);
  }

  for (const message of result.messages) {
    if (message.type === 'dependency' && typeof message.file === 'string') {
      watch(message.file);
    }
  }

  const css = result.root;
  const shared = postcss.root();

  css.walkDecls((declaration) => {
    const source = declaration.source?.input.file;
    if (!source || source === filename || !declaration.value.includes('url(')) {
      return;
    }

    const value = postcssValueParser(declaration.value);

    value.walk((node) => {
      if (node.type !== 'function' || node.value !== 'url') {
        return;
      }

      const url = node.nodes.find((part) => part.type === 'word' || part.type === 'string');
      if (url && relativeUrl(url.value)) {
        url.value = rebaseUrl(url.value, source, filename);
      }
    });

    declaration.value = value.toString();
  });

  for (const node of [...css.nodes]) {
    if (node.type !== 'atrule') {
      continue;
    }
    if (node.name === 'layer' && !node.nodes) {
      shared.append(node.clone());
    }
    if (node.name !== 'import') {
      continue;
    }

    const params = postcssValueParser(node.params);
    const specifier = importSpecifier(params);

    if (specifier && sharedCSS.includes(specifier.value)) {
      const source = node.source?.input.file;

      if (source && specifier.value.startsWith('.')) {
        specifier.value = rebaseUrl(specifier.value, source, filename);
      }

      shared.append(node.clone({ params: params.toString() }));
      node.remove();
    }
  }

  return { screen: css.toString(), shared: shared.toString() };
};
