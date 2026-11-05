import { parseSync } from '@babel/core';

export const parseClassSource = (code: string, filename: string) =>
  parseSync(code, {
    filename,
    babelrc: false,
    configFile: false,
    parserOpts: { plugins: ['typescript', ...(filename.endsWith('x') ? ['jsx' as const] : [])] },
  });
