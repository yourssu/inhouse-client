import { MdClose, MdEdit } from 'react-icons/md';

import type { BaseMemberType } from '@/apis/members/schema';

import { Divider } from '@/components/_ui/Divider';
import { IconButton } from '@/components/_ui/IconButton';
import { ItemList } from '@/components/_ui/ItemList';
import { useMemberEditDialog } from '@/routes/~_auth/~members/~list/hooks/useMemberEditDialog';
import { memberRoleKo } from '@/types/members';
import { partNameKo } from '@/types/parts';
import { formatTemplates } from '@/utils/date';

interface BaseMemberDetailPaperProps<T extends BaseMemberType> {
  isSensitiveMasked?: boolean;
  member: T;
  onClose: () => void;
  slots: {
    personalItems?: React.ReactNode;
    yourssuItems?: React.ReactNode;
  };
}

export const BaseMemberDetailPaper = <T extends BaseMemberType>({
  member,
  onClose,
  isSensitiveMasked,
  slots,
}: BaseMemberDetailPaperProps<T>) => {
  const onClickEdit = useMemberEditDialog(member);

  return (
    <div className="bg-lightBackground text-neutralMuted sticky top-4 h-fit w-100 shrink-0 rounded-xl p-4">
      <div className="mb-4 flex w-full items-center justify-between">
        <h2 className="text-lg font-semibold">{member.nickname} 정보</h2>
        <div className="flex items-center">
          {!isSensitiveMasked && (
            <IconButton
              onClick={onClickEdit}
              size="sm"
              tooltipContent="수정하기"
              tooltipProps={{ side: 'top' }}
            >
              <MdEdit className="text-neutralDisabled text-lg" />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            size="sm"
            tooltipContent="닫기"
            tooltipProps={{ side: 'top' }}
          >
            <MdClose className="text-neutralDisabled text-lg" />
          </IconButton>
        </div>
      </div>
      <ItemList>
        <ItemList.Body>
          <ItemList.Item label="닉네임(발음)">{member.nickname}</ItemList.Item>
          <ItemList.Item label="구분">{member.parts[0].division}</ItemList.Item>
          <ItemList.Item label="파트 · 역할">
            {partNameKo[member.parts[0].part]} · {memberRoleKo[member.role]}
          </ItemList.Item>
          <ItemList.Item label="가입일">
            {formatTemplates['2026-01-01'](member.joinDate)}
          </ItemList.Item>
          {slots.yourssuItems}
          <Divider className="my-4" />
          <ItemList.Item label="이름">{member.name}</ItemList.Item>
          <ItemList.Item label="학번">{member.studentId ?? '********'}</ItemList.Item>
          <ItemList.Item label="학과">{member.department}</ItemList.Item>
          <ItemList.Item label="전화번호">{member.phoneNumber ?? '010-****-****'}</ItemList.Item>
          <ItemList.Item label="이메일">{member.email}</ItemList.Item>
          <ItemList.Item label="생년월일">
            {member.birthDate ? formatTemplates['2026-01-01'](member.birthDate) : '********'}
          </ItemList.Item>
          {slots.personalItems}
          {!isSensitiveMasked && (
            <>
              <Divider className="my-4" />
              <ItemList.Item label="메모">
                <div className="whitespace-pre-wrap">{member.note || '-'}</div>
              </ItemList.Item>
            </>
          )}
        </ItemList.Body>
      </ItemList>
    </div>
  );
};
