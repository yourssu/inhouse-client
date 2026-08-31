import type { PropsWithChildren, ReactNode } from 'react';

import clsx from 'clsx';

export interface PageContentProps {
  className?: string;
  description?: string;
  maxWidth?: 'full' | number;
  right?: ReactNode;
  title?: string;
}

export const PageContent = ({
  title,
  description,
  right,
  children,
  maxWidth = 1600,
  className,
}: PropsWithChildren<PageContentProps>) => {
  return (
    <div className="flex min-h-0 min-w-0 flex-[1_1_0] md:min-h-screen">
      <div
        className={clsx(
          'flex min-w-0 flex-[1_1_0] flex-col px-4 py-6 md:px-13 md:py-9',
          maxWidth !== 'full' && 'mx-auto',
          className,
        )}
        style={{ maxWidth: maxWidth === 'full' ? undefined : maxWidth }}
      >
        {(!!title || !!description || !!right) && (
          <div className="mb-4 flex w-full flex-col items-start gap-3 sm:flex-row sm:justify-between">
            {!!title || !!description ? (
              <div className="min-w-0 sm:shrink-0">
                <h1 className="min-h-9.5 text-2xl font-semibold">{title}</h1>
                {!!description && <h3 className="text-neutralMuted mt-1">{description}</h3>}
              </div>
            ) : null}
            {right && (
              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:flex-1">
                {right}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
