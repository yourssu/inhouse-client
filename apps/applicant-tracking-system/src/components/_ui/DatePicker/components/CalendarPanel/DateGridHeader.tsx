import { weekDaysKo } from '@/components/_ui/DatePicker/utils';

export const DateGridHeader = () => {
  return (
    <div className="mb-1 grid grid-cols-7">
      {weekDaysKo.map((day) => (
        <div
          className="text-neutralMuted text-13 first-of-type:text-red500 py-1 text-center font-medium"
          key={day}
        >
          {day}
        </div>
      ))}
    </div>
  );
};
