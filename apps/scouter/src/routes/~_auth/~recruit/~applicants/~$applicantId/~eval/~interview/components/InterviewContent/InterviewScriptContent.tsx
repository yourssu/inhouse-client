import { Divider } from '@yourssu-inhouse/interior';

import type { InterviewScriptTypes } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/introScript';

const SECTION_HEADING_PATTERN = /^\[.+\]$/;

interface InterviewScriptContentProps {
  selectedScript: InterviewScriptTypes;
}

export const InterviewScriptContent = ({ selectedScript }: InterviewScriptContentProps) => {
  const { content, summary, title } = selectedScript;
  const sections = content.split(/\n{2,}/);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1 p-5">
        <span className="text-18 font-semibold">{title}</span>
        <span className="text-neutralMuted text-xs font-semibold">{summary}</span>
      </div>

      <Divider />
      <div className="flex flex-col gap-4 p-6">
        {sections.map((section, sectionIndex) => (
          <div className="flex flex-col gap-1" key={sectionIndex}>
            {section.split('\n').map((line, lineIndex) =>
              SECTION_HEADING_PATTERN.test(line) ? (
                <span className="text-neutral text-15 font-semibold" key={lineIndex}>
                  {line}
                </span>
              ) : (
                <span className="text-neutralMuted text-sm" key={lineIndex}>
                  {line}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
