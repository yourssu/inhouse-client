import { IoMdAlert } from 'react-icons/io';

// === 1. Props 및 필요 타입들 ===
interface WarningCalloutProps {
  message: string;
}

// === 2. 컴포넌트 본체 코드 ===
export const WarningCallout = ({ message }: WarningCalloutProps) => {
  return (
    <span className="bg-orange50 text-orange600 flex h-[38px] items-center rounded-lg px-4 text-sm font-medium">
      <IoMdAlert className="mr-1.5 text-lg" /> {message}
    </span>
  );
};
