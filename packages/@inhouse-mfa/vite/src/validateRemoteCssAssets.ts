import path from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

export const isRemoteCssAssetSource = (filename: string, root: string) => {
  const relative = path.relative(root, filename);

  return (
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative) &&
    !filename.split(/[\\/]/).includes('node_modules')
  );
};

export const validateRemoteCssAssets = (css: string, filename: string, root: string) => {
  if (!isRemoteCssAssetSource(filename, root)) {
    return;
  }

  postcss.parse(css, { from: filename }).walkDecls((declaration) => {
    valueParser(declaration.value).walk((node) => {
      if (node.type !== 'function' || node.value !== 'url') {
        return;
      }

      const url = node.nodes.find((entry) => entry.type === 'word' || entry.type === 'string');

      if (url?.value.startsWith('/') && !url.value.startsWith('//')) {
        throw declaration.error('Use a source-relative CSS url() for remote assets.');
      }
    });
  });
};
