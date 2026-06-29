import clsx from 'clsx';

const weekDaysKo = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const MonthlyCalendarHeader = () => {
  return (
    <div
      className={clsx(
        'bg-lightBackground border-grey100 calendar-header-lighting-gradient sticky top-24 z-30 grid grid-cols-7 border-b pb-2',
      )}
    >
      {weekDaysKo.map((day, index) => (
        <div
          className={clsx('text-15 pl-2', {
            'text-red400': index === 0,
            'text-neutralDisabled': index !== 0,
          })}
          key={day}
        >
          {day}
        </div>
      ))}
    </div>
  );
};
