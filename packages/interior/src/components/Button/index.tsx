import clsx from 'clsx';
import { useLayoutEffect, useRef, useState } from 'react';
import { usePrevious } from 'react-simplikit';
import { PulseLoader } from 'react-spinners';

import * as styles from './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  left?: React.ReactNode;
  loading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  right?: React.ReactNode;
  size: 'lg' | 'md' | 'sm' | 'xl' | 'xs' | 'xxl' | 'xxs';
  variant?: 'primary' | 'secondary' | 'subPrimary' | 'transparent';
}

const useLoadingButtonSize = ({ loading }: { loading: boolean }) => {
  const savedSizeRef = useRef({ width: 0, height: 0 });
  const prevLoading = usePrevious(loading);
  const [minSize, setMinSize] = useState<{ height?: number; width?: number }>({});

  const ref = (node: HTMLButtonElement | null) => {
    if (!node || loading) {
      return;
    }
    savedSizeRef.current = {
      width: node.offsetWidth,
      height: node.offsetHeight,
    };
  };

  useLayoutEffect(() => {
    if (loading && !prevLoading && savedSizeRef.current.width > 0) {
      setMinSize(savedSizeRef.current);
    } else if (!loading && prevLoading) {
      setMinSize({});
    }
  }, [loading, prevLoading]);

  return {
    ref,
    minSize,
  };
};

export const Button = ({
  variant = 'primary',
  size,
  left,
  right,
  children,
  className,
  loading = false,
  ref: outerRef,
  ...props
}: ButtonProps) => {
  const buttonStyle = styles.button({ variant, size });
  const { ref: buttonRef, minSize } = useLoadingButtonSize({ loading });

  const setOuterRef = (node: HTMLButtonElement | null) => {
    if (!outerRef) {
      return;
    }
    if (typeof outerRef === 'function') {
      outerRef(node);
    } else {
      outerRef.current = node;
    }
  };

  return (
    <button
      className={clsx(buttonStyle, className)}
      disabled={loading || props.disabled}
      ref={(node) => {
        buttonRef(node);
        setOuterRef(node);
      }}
      style={{ minWidth: minSize.width, minHeight: minSize.height }}
      {...props}
    >
      {loading ? (
        <PulseLoader color="currentColor" size={6} speedMultiplier={0.8} />
      ) : (
        <>
          {left && <div className={styles.icon}>{left}</div>}
          <div style={{ flex: '1 1 0%' }}>{children}</div>
          {right && <div className={styles.icon}>{right}</div>}
        </>
      )}
    </button>
  );
};
