import type { RemoteGlobal } from './types';

export const REMOTE_GLOBAL_UPDATE_EVENT = 'inhouse-mfa:remote-global-update';

export interface RemoteGlobalUpdate {
  global: RemoteGlobal;
  name: string;
}
