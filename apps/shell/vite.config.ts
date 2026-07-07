import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { mfaVitePlugin } from '@yourssu-inhouse/mfa-vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { mfaConfig } from '../../mfa.config';

/*
  shell 은 Module Federation host("shell")예요.
  런타임에 scouter·inhouse remote 의 routeTree 를 loadRemote 로 가져와 자기 _auth 아래에 graft 해요.
  federation(shared/remotes/dev.remoteHmr) 은 mfaVitePlugin.shell 이 mfa.config 로부터 자동 생성해요.
  remoteEntry URL 은 dev(localhost 포트)를 기본으로 하고, prod 는 VITE_<ID>_URL env 로 덮어요.
*/
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      mfaVitePlugin.shell({ config: mfaConfig, env }),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      tsconfigPaths(),
    ],
    server: {
      port: 5173,
      fs: {
        // TanStack Router 파일 기반 라우팅은 `~` 를 escape prefix 로 써요
        // (예: `~signin/~index.lazy.tsx`). Vite 8 는 Windows 에서 `~` 가 포함된
        // 경로를 NTFS 8.3 short-name 경로 순회 방어를 위해 fs.allow 확인 전에
        // 무조건 403 으로 차단해요 → Windows 팀원은 lazy route 로딩이 전부 실패.
        // dev server 에서만 strict 검사를 꺼서 우회해요. (build 에는 영향 없음)
        strict: false,
      },
    },
  };
});
