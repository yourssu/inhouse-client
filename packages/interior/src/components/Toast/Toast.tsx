import type { ComponentProps } from 'react';

import { Lottie } from '@toss/lottie';
import { lotties } from '@yourssu-inhouse/resources';

import type { ToastType } from './type';

import * as styles from './Toast.css';

type LottieProps = Omit<ComponentProps<typeof Lottie>, 'json' | 'src' | 'suspense'>;
const lottieProps: Record<ToastType, LottieProps> = {
  success: {
    speed: 1.5,
  },
  error: {
    speed: 1,
  },
  default: {},
};

const lottieData: Record<ToastType, string | undefined> = {
  default: undefined,
  success: lotties.success,
  error: lotties.error,
};

export const Toast = ({ children, type }: React.PropsWithChildren<{ type: ToastType }>) => {
  const data = lottieData[type];
  const options = lottieProps[type];

  return (
    <div className={styles.toastContainer}>
      <div className={styles.lottieWrapper({ type })}>
        {!!data && <Lottie {...options} autoPlay json={data} loop={false} />}
      </div>
      {children}
    </div>
  );
};
