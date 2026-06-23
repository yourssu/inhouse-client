export const TAB_CATEGORIES = [
  {
    title: '기초',
    items: ['Lottie', 'Colors'],
  },
  {
    title: '버튼',
    items: ['Button', 'IconButton'],
  },
  {
    title: '입력',
    items: ['TextField', 'SearchField', 'DatePicker', 'Switch'],
  },
  {
    title: '선택',
    items: ['Select', 'Checkbox', 'Combobox'],
  },
  {
    title: '네비게이션',
    items: ['ChipTab', 'SegmentedControl', 'Tab', 'TabButton'],
  },
  {
    title: '오버레이',
    items: ['Dialog', 'Toast'],
  },
  {
    title: '표시',
    items: ['Badge'],
  },
] as const;

export const tabs = TAB_CATEGORIES.flatMap((category) => category.items);

export type TabType = (typeof tabs)[number];
