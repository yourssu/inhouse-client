import type { PropsWithChildren } from 'react';

import { motion } from 'motion/react';
import { IoMdArrowBack } from 'react-icons/io';

import { InlineButton } from '@/components/_ui/InlineButton';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 10 : -10,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -10 : 10,
    opacity: 0,
  }),
};

interface AnimatedStepProps extends PropsWithChildren {
  className?: string;
  direction: number;
  onBack?: () => void;
}

export const AnimatedStep = ({
  children,
  className = 'flex flex-col',
  direction,
  onBack,
}: AnimatedStepProps) => {
  return (
    <motion.div
      animate="center"
      className={className}
      custom={direction}
      exit="exit"
      initial="enter"
      transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
      variants={variants}
    >
      {onBack && (
        <div className="pt-1.5 pr-1.5 pb-1 pl-[3px]">
          <InlineButton className="text-neutralSubtle pl-[3px] text-sm" onClick={onBack}>
            <div className="flex items-center gap-1">
              <IoMdArrowBack className="text-md" />
              <span>뒤로가기</span>
            </div>
          </InlineButton>
        </div>
      )}
      {children}
    </motion.div>
  );
};
