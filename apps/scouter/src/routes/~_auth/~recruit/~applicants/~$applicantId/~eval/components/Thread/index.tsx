import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { IconButton, Menu } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { useState } from 'react';
import { IoIosMore } from 'react-icons/io';

import type { CommentType } from '@/apis/eval/comments/schema';

import type { CommentThread } from '../../utils/groupThreadsBySection';

import { CommentField } from './CommentField';

interface CommentProps extends CommentType {
  applicantId: number;
}

export const Comment = ({ content, author, createdAt, isEdited }: CommentProps) => {
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
        <div className="ease-ease opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Menu>
            <Menu.Trigger>
              <IconButton className="rounded-4" size="xxs" variant="inline">
                <IoIosMore className="size-4" />
              </IconButton>
            </Menu.Trigger>
            <Menu.Content align="end">
              {/* TODO(SCO-142): 편집하기 메뉴 항목 */}

              {/* TODO(SCO-141): 삭제하기 메뉴 항목 */}
            </Menu.Content>
          </Menu>
        </div>
      </div>
      <p className="text-13 min-h-fit border-transparent p-0 pl-1 whitespace-pre-wrap">{content}</p>
    </div>
  );
};

interface ThreadProps {
  applicantId: number;
  selectedSectionId: null | number;
  thread: CommentThread;
}

export const Thread = ({ applicantId, selectedSectionId, thread }: ThreadProps) => {
  const { sectionId, commentId: currentThreadId } = thread[0];
  const isSelectedSection = sectionId === selectedSectionId;
  const [isReplying, setIsReplying] = useState(false);

  const [threadEl, setThreadEl] = useState<HTMLDivElement | null>(null);

  return (
    <div
      className={cn(
        'rounded-8 hover:bg-grey50 relative z-10 flex flex-col gap-3 border p-4 transition-transform hover:-translate-x-1',
        isSelectedSection ? 'border-violet300' : 'border-grey200',
      )}
      onClick={() => setIsReplying(true)}
      ref={setThreadEl}
    >
      {thread.map((comment) => (
        <Comment key={comment.commentId} {...comment} applicantId={applicantId} />
      ))}
      {isReplying && (
        <CommentField
          applicantId={applicantId}
          extraContainers={[threadEl]}
          onClose={() => setIsReplying(false)}
          parentCommentId={currentThreadId}
          placeholder="댓글 추가"
          sectionId={sectionId}
        />
      )}
    </div>
  );
};
