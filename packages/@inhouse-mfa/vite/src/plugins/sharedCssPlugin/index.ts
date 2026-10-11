import type { Plugin, ResolvedConfig } from 'vite';

import { createRemoteCssPolicy } from '../../remoteCssPolicy';

export const sharedCssPlugin = (sharedCSS: readonly string[]): Plugin => {
  let policy: ReturnType<typeof createRemoteCssPolicy>;

  return {
    name: 'mfa-shared-css',
    enforce: 'pre',
    configResolved(config) {
      policy = createRemoteCssPolicy(config, sharedCSS);

      // Vite's CSS imports and Tailwind bypass the normal plugin resolveId/load pipeline.
      const createResolver: ResolvedConfig['createResolver'] = (options) => {
        const resolve = policy.nativeCreateResolver(options);

        return async (...args) => {
          const resolved = await resolve(...args);

          return resolved ? policy.replace(resolved) : resolved;
        };
      };

      Object.defineProperty(config, 'createResolver', { value: createResolver });
    },
    async buildStart() {
      await policy.initialize();
    },
    async resolveId(source, importer, options) {
      if (source.startsWith('\0')) {
        return;
      }

      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });

      if (!resolved || resolved.external) {
        return resolved;
      }

      return { ...resolved, id: await policy.replace(resolved.id) };
    },
  };
};
