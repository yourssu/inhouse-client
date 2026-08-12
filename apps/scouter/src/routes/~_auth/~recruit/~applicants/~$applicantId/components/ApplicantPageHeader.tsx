import type { PropsWithChildren } from 'react';

import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Badge } from '@yourssu-inhouse/interior';
import { MdPerson } from 'react-icons/md';

import type { ApplicantType } from '@/apis/applicants/schema';

import { applicantStateKo } from '@/types/applicants';
import { partNameKo } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

interface ApplicantPageHeaderProps {
  applicant: ApplicantType;
  deadline?: string;
  label: string;
}

export const ApplicantPageHeader = ({ applicant, deadline, label }: ApplicantPageHeaderProps) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="bg-grey200 flex size-12 shrink-0 items-center justify-center rounded-lg">
          <MdPerson aria-hidden className="size-7" />
        </div>
        <div className="min-w-0">
          <div className="text-sm">
            <span className="text-violet600 font-medium">{label}</span>
            {deadline !== undefined && (
              <>
                <span className="text-neutralSubtle mx-1.5">·</span>
                <span className="text-neutralSubtle">
                  {formatTemplates['(2026년)? 1월 1일, 오후 11:00'](deadline)} 마감
                </span>
              </>
            )}
          </div>
          <h1 className="truncate text-xl font-semibold">{applicant.name} 지원자</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <InfoItem label="지원 파트">{partNameKo[applicant.part]}</InfoItem>
        <InfoItem label="심사 상태">
          <Badge color="violet" size="sm">
            {applicantStateKo[applicant.state]}
          </Badge>
        </InfoItem>
        <InfoItem label="학번">{applicant.studentId}</InfoItem>
        <InfoItem label="학과">{applicant.department}</InfoItem>
        <InfoItem label="현재 학기">{formatSemester(applicant.academicSemester)}</InfoItem>
        <InfoItem label="나이">{applicant.age}세</InfoItem>
        <InfoItem label="지원일">
          {formatTemplates['2026-01-01'](applicant.applicationDate)}
        </InfoItem>
      </div>
    </header>
  );
};

const InfoItem = ({ children, label }: PropsWithChildren<{ label: string }>) => {
  return (
    <div className="text-13 border-greyOpacity200 flex items-center gap-2.5 not-first-of-type:border-l not-first-of-type:pl-3">
      <div className="text-neutralSubtle">{label}</div>
      <div className="text-neutralMuted font-medium">{children}</div>
    </div>
  );
};
