import type { KyInstance } from 'ky';

export const enablePrivilegeForSelf = async (api: KyInstance) => {
  await api.post('internal/dev/member-privacy/privileged/self/enable');
};

export const disablePrivilegeForSelf = async (api: KyInstance) => {
  await api.post('internal/dev/member-privacy/privileged/self/disable');
};
