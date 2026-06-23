import type { ComponentProps } from 'react';

import { Lottie } from '@toss/lottie';

import { tv } from '@/utils/tw';

import { ToastLottieAssetMap, type ToastType } from './type';

const lottie = tv({
  base: 'flex shrink-0 items-center justify-center',
  variants: {
    type: {
      error: 'size-8.5 p-1',
      success: 'size-8.5',
      default: 'h-8.5 w-2.5',
    },
  },
});

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
    <div className="dark:bg-backgroundLevel02 bg-grey900 text-15 flex w-fit items-center rounded-xl py-1 pr-5.5 pl-3 font-medium text-white">
      <div className={lottie({ type })}>
        {!!src && <Lottie {...options} autoPlay loop={false} src={src} />}
      </div>
      {children}
    </div>
  );
};
