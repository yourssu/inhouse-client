import type { ReactNode } from 'react';

import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import clsx from 'clsx';

import type { CommentType } from '@/apis/documents/schema';

interface CommentThreadFrameProps {
  children: ReactNode;
  isSelected: boolean;
  onClick?: () => void;
}

export const CommentThreadFrame = ({ children, isSelected, onClick }: CommentThreadFrameProps) => {
  return (
    <div
      className={clsx(
        'rounded-8 hover:bg-grey50 relative left-0 z-10 flex flex-col gap-3 border p-4 transition-[left] hover:-left-1',
        isSelected ? 'border-violet300' : 'border-grey200',
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CommentItemProps {
  actions?: ReactNode;
  children: ReactNode;
  comment: CommentType;
}

export const CommentItem = ({ actions, children, comment }: CommentItemProps) => {
  const { author, createdAt, isEdited } = comment;
  const relativeTime = createdAt
    ? formatTemplates['방금 전 | 1(분/시간/일/주/개월/년) 전'](new Date(createdAt))
    : null;

  return (
    <div className="group min-w-60 gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-13 font-medium">
            {author.nickname} [{author.part}]
          </span>
          {relativeTime && (
            <span className="text-neutralSubtle text-xs">
              {isEdited ? `${relativeTime} (편집됨)` : relativeTime}
            </span>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
};

interface CommentBodyProps {
  children: ReactNode;
}

export const CommentBody = ({ children }: CommentBodyProps) => (
  <p className="text-13 min-h-fit border-transparent p-0 pl-1 whitespace-pre-wrap">{children}</p>
);
