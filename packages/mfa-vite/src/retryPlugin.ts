import { RetryPlugin } from '@module-federation/retry-plugin';

export default () =>
  RetryPlugin({
    retryDelay: 800,
    retryTimes: 5,
  });
