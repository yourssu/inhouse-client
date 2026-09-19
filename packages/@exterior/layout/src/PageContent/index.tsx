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
    <div className="flex min-h-screen min-w-0 flex-[1_1_0]">
      <div
        className={clsx(
          'flex flex-[1_1_0] flex-col px-13 py-9',
          maxWidth !== 'full' && 'mx-auto',
          className,
        )}
        style={{ maxWidth: maxWidth === 'full' ? undefined : maxWidth }}
      >
        {(!!title || !!description || !!right) && (
          <div className="mb-4 flex w-full items-start justify-between">
            {!!title || !!description ? (
              <div className="shrink-0">
                <h1 className="min-h-9.5 text-2xl font-semibold">{title}</h1>
                {!!description && <h3 className="text-neutralMuted mt-1">{description}</h3>}
              </div>
            ) : null}
            {right && <div className="flex flex-1 items-center justify-end gap-2">{right}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
