import type { ComponentProps } from 'react';

import { Lottie } from '@toss/lottie';
import { lotties } from '@yourssu-inhouse/resources';

import type { ToastType } from './type';

import * as styles from './Toast.css';

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

/*
  default 토스트는 로띠 없음. success·error 는 @yourssu-inhouse/resources 의 번들된
  lottie 데이터를 json prop 으로 넘겨요. 런타임 fetch(src) 없이 그려져서 module federation
  host(shell) origin 에 lottie 파일이 없어도 동작해요.
*/
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
