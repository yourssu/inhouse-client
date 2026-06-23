import type { ComponentProps } from 'react';

import { Lottie } from '@toss/lottie';

import * as styles from './Toast.css';
import { ToastLottieAssetMap, type ToastType } from './type';

type LottieProps = Omit<ComponentProps<typeof Lottie>, 'json' | 'src'>;
const lottieProps: Record<ToastType, LottieProps> = {
  success: {
    speed: 1.5,
  },
  error: {
    speed: 1,
  },
  default: {},
};

export const Toast = ({ children, type }: React.PropsWithChildren<{ type: ToastType }>) => {
  const src = ToastLottieAssetMap[type];
  const options = lottieProps[type];

  return (
    <div className={styles.toastContainer}>
      <div className={styles.lottieWrapper({ type })}>
        {!!src && <Lottie {...options} autoPlay loop={false} src={src} />}
      </div>
      {children}
    </div>
  );
};
