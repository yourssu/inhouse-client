import type { ResolvedConfig } from 'vite';

export const cssResolverOptions = {
  extensions: ['.css'],
  mainFields: ['style'],
  conditions: ['style', 'development|production'],
  tryIndex: false,
  preferRelative: true,
};

export const createCssResolver = (config: ResolvedConfig) =>
  config.createResolver(cssResolverOptions);
