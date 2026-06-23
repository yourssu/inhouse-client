import { type DateArg, differenceInMinutes, formatDistanceToNowStrict, isThisYear } from 'date-fns';
import { formatWithOptions } from 'date-fns/fp';
import { ko } from 'date-fns/locale';

const formatKo = formatWithOptions({ locale: ko });
// https://github.com/date-fns/date-fns/blob/main/src/locale/ko/snapshot.md
export const formatTemplates = {
  '1월 1일 월요일': formatKo('MMM do EEEE'),
  '1월 1일(월요일)': formatKo('MMM do(EEEE)'),
  '1월 1일 (월) 오후 11:00': formatKo('MMM do (E) aaaa h:mm'),
  '1월 1일 (월) 23:00': formatKo('MMM do (E) HH:mm'),
  '26.01.01 23:00': formatKo('yy.MM.dd HH:mm'),
  '2026. 01. 01 23:00': formatKo('yyyy. MM. dd HH:mm'),
  '1월 1일 (월) 23시 00분': formatKo('MMM do (E) HH시 mm분'),
  '1.1 (월)': formatKo('M.d (E)'),
  '1.01 (월)': formatKo('M.dd (E)'),
  '1.01 (월) 23:00': formatKo('M.dd (E) HH:mm'),
  '1/01(월) 오후 11:00': formatKo('M/dd(E) aaaa h:mm'),
  '26년 1월 1일': formatKo('yy년 MMM do'),
  '26년 1월': formatKo('yy년 MMM'),
  '26-01-01': formatKo('yy-MM-dd'),
  '2026-01-01': formatKo('yyyy-MM-dd'),
  '2026/01/01 23:00': formatKo('yyyy/MM/dd HH:mm'),
  '26/01/01 23:00': formatKo('yy/MM/dd HH:mm'),
  '01/01 23:00': formatKo('MM/dd HH:mm'),
  '26.01.01': formatKo('yy.MM.dd'),
  '2026. 1.': formatKo('yyyy. M.'),
  '2026. 01. 01': formatKo('yyyy. MM. dd'),
  '26. 1. 1': formatKo('yy. M. d'),
  '26년 1월 1일 23시': formatKo('yy년 MMM do HH시'),
  '1월 1일': formatKo('MMM do'),
  '2026년 1월 1일': formatKo('yyyy년 MMM do'),
  '2026년 1월': formatKo('yyyy년 MMM'),
  '26년 1월 1일 (월요일)': formatKo('yy년 MMM do (EEEE)'),
  '오후 11:00': formatKo('a h:mm'),
  '1일 23:00': formatKo('do HH:mm'),
  '23:00': formatKo('HH:mm'),
  '1월 1일, 오후 11:00': formatKo('MMM do, aaaa h:mm'),
  '(2026년)? 1월 1일, 오후 11:00': (v: DateArg<Date>) => {
    const fn = formatKo(isThisYear(v) ? 'MMM do, aaaa h:mm' : 'yyyy년 MMM do, aaaa h:mm');
    return fn(v);
  },
  '방금 전 | 1(분/시간/일/주/개월/년) 전': (v: DateArg<Date>) => {
    if (differenceInMinutes(new Date(), v) === 0) {
      return '방금 전';
    }
    return formatDistanceToNowStrict(v, { addSuffix: true, locale: ko });
  },
};
