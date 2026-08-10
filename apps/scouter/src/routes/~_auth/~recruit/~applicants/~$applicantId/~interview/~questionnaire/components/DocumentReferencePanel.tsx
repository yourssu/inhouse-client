import { useSuspenseQueries } from '@tanstack/react-query';

import { applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { applicantDocumentCommentsOption } from '@/apis/documents/query';
import {
  CommentBody,
  CommentItem,
  CommentThreadFrame,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/DocumentComment';
import { DocumentReview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/DocumentReview';

interface DocumentReferencePanelProps {
  applicantId: number;
}

export const DocumentReferencePanel = ({ applicantId }: DocumentReferencePanelProps) => {
  const [{ data: answers }, { data: comments }] = useSuspenseQueries({
    queries: [
      applicantDocumentAnswersOption(applicantId),
      applicantDocumentCommentsOption(applicantId),
    ],
  });

  return (
    <DocumentReview
      answers={answers}
      comments={comments}
      renderThread={({ isSelected, thread }) => (
        <CommentThreadFrame isSelected={isSelected} key={thread[0].commentId}>
          {thread.map((comment) => (
            <CommentItem comment={comment} key={comment.commentId}>
              <CommentBody>{comment.content}</CommentBody>
            </CommentItem>
          ))}
        </CommentThreadFrame>
      )}
    />
  );
};
