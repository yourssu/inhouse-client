import { useSuspenseQueries } from '@tanstack/react-query';

import { applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { applicantDocumentCommentsOption } from '@/apis/documents/query';
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

  return <DocumentReview answers={answers} applicantId={applicantId} comments={comments} />;
};
