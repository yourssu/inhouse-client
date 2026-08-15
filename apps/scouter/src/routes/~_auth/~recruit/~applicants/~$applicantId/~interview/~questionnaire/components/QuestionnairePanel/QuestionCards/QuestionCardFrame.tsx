import type { ComponentPropsWithoutRef } from 'react';

import clsx from 'clsx';

type QuestionCardFrameProps = ComponentPropsWithoutRef<'article'>;

export const QuestionCardFrame = ({ className, onClick, ...props }: QuestionCardFrameProps) => {
  return (
    <article
      {...props}
      className={clsx(
        'border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-2 border px-4 py-3',
        onClick !== undefined && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    />
  );
};
