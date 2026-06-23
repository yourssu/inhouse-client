import type { EditFormContextType } from '@/routes/~_auth/~members/~list/type';

import { MultilineTextField } from '@/components/_ui/MultilineTextField';
import { useSetStateSelector } from '@/hooks/useSetStateSelector';

interface MemberMemoFormProps {
  context: EditFormContextType;
  setContext: React.Dispatch<React.SetStateAction<EditFormContextType>>;
}

export const MemberMemoForm = ({ context, setContext }: MemberMemoFormProps) => {
  const setters = {
    memo: useSetStateSelector(setContext, 'member.note'),
  };

  return (
    <div className="flex flex-col gap-3">
      <MultilineTextField
        onChange={(v) => setters.memo(v.target.value)}
        placeholder="이 멤버에 관한 내용을 자유롭게 남겨주세요."
        value={context.member.note ?? ''}
        withHeightAutoResize
      />
    </div>
  );
};
