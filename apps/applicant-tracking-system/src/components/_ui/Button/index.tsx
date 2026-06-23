import { useLayoutEffect, useRef, useState } from 'react';
import { usePrevious } from 'react-simplikit';
import { PulseLoader } from 'react-spinners';

import { cn, tv } from '@/utils/tw';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  left?: React.ReactNode;
  loading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  right?: React.ReactNode;
  size: 'lg' | 'md' | 'sm' | 'xl' | 'xs' | 'xxl' | 'xxs';
  variant?: 'primary' | 'secondary' | 'subPrimary' | 'transparent';
}

const button = tv({
  base: 'group flex cursor-pointer items-center justify-center gap-1 transition-[background-color_0.2s_ease,color_0.2s_ease] disabled:cursor-not-allowed',
  variants: {
    variant: {
      primary:
        'bg-buttonPrimaryBackground disabled:text-buttonPrimaryColorDisabled hover:bg-buttonPrimaryBackgroundHovered disabled:bg-buttonPrimaryBackgroundDisabled text-buttonPrimaryColor',
      secondary:
        'text-buttonSecondaryColor disabled:text-buttonSecondaryColorDisabled bg-buttonSecondaryBackground hover:bg-buttonSecondaryBackgroundHovered disabled:bg-buttonSecondaryBackgroundDisabled',
      subPrimary:
        'bg-buttonSubPrimaryBackground disabled:text-buttonSubPrimaryColorDisabled hover:bg-buttonSubPrimaryBackgroundHovered disabled:bg-buttonSubPrimaryBackgroundDisabled text-buttonSubPrimaryColor',
      transparent:
        'text-buttonTransparentColor disabled:text-buttonTransparentColorDisabled bg-buttonTransparentBackground hover:bg-buttonTransparentBackgroundHovered disabled:bg-buttonTransparentBackgroundDisabled',
    },
    size: {
      xxs: 'text-tiny h-5 rounded-md px-1.5 font-medium',
      xs: 'h-6 rounded-md px-2 text-xs font-medium',
      sm: 'text-13 h-7 rounded-lg px-2.5 font-medium',
      md: 'h-8 rounded-lg px-3 text-sm font-medium',
      lg: 'text-15 h-9.5 rounded-[10px] px-4 font-medium',
      xl: 'text-17 h-12 rounded-[14px] px-5 font-medium',
      xxl: 'text-17 h-17 rounded-2xl px-7 font-medium',
    },
  },
});

const icon = tv({
  base: 'transition-[opacity_0.2s_ease] group-disabled:opacity-45',
});

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
  const buttonStyle = button({ variant, size });
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
      className={cn(buttonStyle, className)}
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
          {left && <div className={icon()}>{left}</div>}
          <div className="flex-[1_1_0]">{children}</div>
          {right && <div className={icon()}>{right}</div>}
        </>
      )}
    </button>
  );
};
