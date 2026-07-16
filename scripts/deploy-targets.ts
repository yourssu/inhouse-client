import { execSync } from 'node:child_process';
import { mfaConfig } from '../mfa.config';

// mfa.config.ts 의 remotes 에서 배포 매트릭스를 파생한다. remote 추가 시 워크플로우 수정 없이 자동 편입.
// remote URL 오버라이드(커스텀 도메인): DEPLOY_URL_<ID> env. shell 은 envFile 을 .env.production.local 로 쓴다.
// --base=<sha> 가 주어지면 git diff 로 변경된 앱만 남긴다(미주어지면 전체).

type Env = 'prod' | 'dev';

const ENV_SUFFIX: Record<Env, string> = { prod: '', dev: '-dev' };

const parseEnv = (): Env => {
  const arg = process.argv.find((a) => a.startsWith('--env='));
  return arg?.split('=')[1] === 'prod' ? 'prod' : 'dev';
};

const parseBase = (): string | undefined => {
  const arg = process.argv.find((a) => a.startsWith('--base='));
  return arg?.split('=')[1] || undefined;
};

const env = parseEnv();
const base = parseBase();

const projectName = (id: string): string => `inhouse-${id}-client${ENV_SUFFIX[env]}`;

const remoteEntryUrl = (id: string): string => {
  const override = process.env[`DEPLOY_URL_${id.toUpperCase()}`];
  return override ?? `https://${projectName(id)}.pages.dev/remoteEntry.js`;
};

interface DeployTarget {
  app: string;
  isShell: boolean;
  project: string;
  dist: string;
  /** shell 전용: .env.production.local 에 쓸 VITE_<ID>_URL 라인들 */
  envFile: string;
}

const shellTarget = (): DeployTarget => {
  const envFileLines = mfaConfig.remotes.map(
    (r) => `VITE_${r.id.toUpperCase()}_URL=${remoteEntryUrl(r.id)}`,
  );

  // NOTE: dev 환경에서 MSW 모킹을 사용할 수 있도록 환경 변수를 주입해줘요.
  if (env === 'dev') {
    envFileLines.push('VITE_USE_MSW=true');
  }

  return {
    app: 'shell',
    isShell: true,
    project: `inhouse-client${ENV_SUFFIX[env]}`,
    dist: 'apps/shell/dist',
    envFile: envFileLines.join('\n'),
  };
};

const remoteTarget = (id: string): DeployTarget => ({
  app: id,
  isShell: false,
  project: projectName(id),
  dist: `apps/${id}/dist`,
  envFile: '',
});

const allTargets = (): DeployTarget[] => [
  shellTarget(),
  ...mfaConfig.remotes.map((r) => remoteTarget(r.id)),
];

// 공용/인프라 경로가 바뀌면 모든 앱이 영향받는다.
const SHARED_PREFIXES = [
  'packages/',
  'pnpm-lock.yaml',
  'mfa.config.ts',
  'turbo.json',
  'scripts/',
  'tsconfig.json',
  '.github/workflows/deploy-pages.yml',
];

const changedApps = (base: string): string[] | 'all' => {
  const files = execSync(`git diff --name-only ${base} HEAD`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  const apps = new Set<string>();
  for (const file of files) {
    if (SHARED_PREFIXES.some((p) => file.startsWith(p))) return 'all';
    if (file.startsWith('apps/shell/')) apps.add('shell');
    for (const r of mfaConfig.remotes) {
      if (file.startsWith(`apps/${r.id}/`)) apps.add(r.id);
    }
  }
  return [...apps];
};

const targets = !base
  ? allTargets()
  : (() => {
      const apps = changedApps(base);
      if (apps === 'all') return allTargets();
      const selected = new Set(apps);
      return allTargets().filter((t) => selected.has(t.app));
    })();

process.stdout.write(JSON.stringify(targets));
