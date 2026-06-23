import { api } from '@/apis/api';

export const enablePrivileged = async () => {
  await api.post('internal/dev/member-privacy/privileged/self/enable');
};

export const disablePrivileged = async () => {
  await api.post('internal/dev/member-privacy/privileged/self/disable');
};
