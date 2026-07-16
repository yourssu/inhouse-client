import { mfaConfig } from '../mfa.config';

type Env = 'prod' | 'dev';

const ENV_SUFFIX: Record<Env, string> = { prod: '', dev: '-dev' };

const parseEnv = (): Env => {
  const arg = process.argv.find((a) => a.startsWith('--env='));
  return arg?.split('=')[1] === 'prod' ? 'prod' : 'dev';
};

const env = parseEnv();

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

const envFile = mfaConfig.remotes
  .map((r) => `VITE_${r.id.toUpperCase()}_URL=${remoteEntryUrl(r.id)}`)
  .join('\n');

const targets: DeployTarget[] = [
  {
    app: 'shell',
    isShell: true,
    project: `inhouse-client${ENV_SUFFIX[env]}`,
    dist: 'apps/shell/dist',
    envFile,
  },
  ...mfaConfig.remotes.map((r) => ({
    app: r.id,
    isShell: false,
    project: projectName(r.id),
    dist: `apps/${r.id}/dist`,
    envFile: '',
  })),
];

process.stdout.write(JSON.stringify(targets));
