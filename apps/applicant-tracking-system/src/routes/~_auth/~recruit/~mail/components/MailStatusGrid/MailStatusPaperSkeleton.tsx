import { motion } from 'motion/react';

import { Paper } from '@/components/Paper';

const animate = {
  opacity: [1, 0.4, 1],
};

const transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 1.6,
  repeat: Infinity,
} as const;

export const MailStatusPaperSkeleton = () => {
  return (
    <Paper className="flex h-17 items-center gap-3 p-3">
      <motion.div
        animate={animate}
        className="bg-greyOpacity50 size-11 shrink-0 rounded-xl"
        transition={transition}
      />
      <div className="flex w-full flex-col gap-1.5">
        <motion.div
          animate={animate}
          className="bg-greyOpacity50 h-3.5 w-1/2 rounded-md"
          transition={transition}
        />
        <motion.div
          animate={animate}
          className="bg-greyOpacity50 h-6 w-1/2 rounded-md"
          transition={transition}
        />
      </div>
    </Paper>
  );
};
