import type { Merge } from '@yourssu-inhouse/inhouse-utils/type';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export type DatePickerProps = {
  /** 트리거 커스텀 className */
  className?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 최대 선택 가능 날짜 */
  maxDate?: Date;
  /** 최소 선택 가능 날짜 */
  minDate?: Date;
  /** 날짜 변경 핸들러 */
  onChange?: (date: Date) => void;
  /** 크기 */
  size: 'lg' | 'md' | 'sm' | 'xs';
  /** 선택된 날짜 */
  value?: Date | null;
  /** 변형 패턴 */
  variant: 'dimmed' | 'inline' | 'outline';
};

export type DateRangePickerProps = Merge<
  DatePickerProps,
  {
    /** 최대 선택 가능 기간 (일 단위) */
    maxRangeDays?: number;
    /** 날짜 범위 변경 핸들러 */
    onChange?: (range: { from: Date; to: Date }) => void;
    /** 선택된 날짜 범위 */
    value?: DateRange;
  }
>;
