import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';

import { useToastContext } from './context';
import { Toast } from './Toast';
import * as styles from './Toast.css';

const toastPaddingTop = 48;
const toastGap = 60;

const variants = {
  hidden: (index: number) => ({
    opacity: 0,
    scale: 0.9,
    x: '-50%',
    y: index * toastGap + toastPaddingTop,
  }),
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    x: '-50%',
    y: index * toastGap + toastPaddingTop,
  }),
};

export const ToastAnimationGroup = () => {
  const { toasts } = useToastContext();

  return createPortal(
    <AnimatePresence>
      {toasts.map(({ id, text, type }, index) => {
        return (
          <motion.div
            animate="visible"
            className={styles.motionWrapper}
            custom={toasts.length - index - 1}
            exit="hidden"
            initial="hidden"
            key={id}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
            variants={variants}
          >
            <Toast type={type}>{text}</Toast>
          </motion.div>
        );
      })}
    </AnimatePresence>,
    document.body,
  );
};
