import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';

import type { CommentType } from '@/apis/eval/comments/schema';

import type { CommentThread } from '../../utils/groupThreadsBySection';

export const Comment = ({ content, author, createdAt, isEdited }: CommentType) => {
  const { nickname, part } = author;
  const leftTime = formatTemplates['방금 전 | 1(분/시간/일/주/개월/년) 전'](new Date(createdAt));

  return (
    <div className="group min-w-60 gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-13 font-medium">
            {nickname} [{part}]
          </span>
          <span className="text-neutralSubtle text-xs">
            {isEdited ? `${leftTime} (편집됨)` : `${leftTime}`}
          </span>
        </div>
      </div>
      <p className="text-13 min-h-fit border-transparent p-0 pl-1 whitespace-pre-wrap">{content}</p>
    </div>
  );
};

interface CommentsProps {
  onClick: () => void;
  selectedSectionId: null | number;
  thread: CommentThread;
}

export const Comments = ({ selectedSectionId, thread, onClick }: CommentsProps) => {
  const sectionId = thread[0].sectionId;
  const isSelectedSection = sectionId === selectedSectionId;

  return (
    <div
      className={cn(
        'rounded-8 hover:bg-grey50 relative z-10 flex flex-col gap-3 border p-4 transition-transform hover:-translate-x-1',
        isSelectedSection ? 'border-violet300' : 'border-grey200',
      )}
      data-comments
      onClick={onClick}
    >
      {thread.map((comment) => (
        <Comment key={comment.commentId} {...comment} />
      ))}
    </div>
  );
};
