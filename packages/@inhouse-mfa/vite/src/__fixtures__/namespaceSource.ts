const helpers = `
export const cn = (...values) => values.flat(Infinity).flatMap(value =>
  typeof value === 'string' ? [value] : value && typeof value === 'object'
    ? Object.entries(value).filter(([, enabled]) => enabled).map(([key]) => key) : []
).join(' ');
export const tv = recipe => recipe;
`;
const helpersUrl = `data:text/javascript;base64,${Buffer.from(helpers).toString('base64')}`;

export const sourceCases = [
  {
    name: 'JSX entity decoding and quoted arbitrary classes',
    filename: 'fixture.tsx',
    code: `
const element = (tag, props) => props;
export const result = [
  <div className="px-8&#32;py-4" />,
  <div className="content-['a&quot;b']" />,
];`,
    expected: [
      { className: 'fixture__px-8 fixture__py-4' },
      { className: "fixture__content-['a\"b']" },
    ],
  },
  {
    name: 'JSX class attributes and custom component class props',
    filename: 'fixture.tsx',
    code: `
const element = (tag, props) => props;
const Box = () => null;
export const result = [
  <div className="px-8 py-4" title="hidden" style={{ display: 'flex' }} />,
  <Box contentClassName={'hidden'} aria-label="flex" />,
];`,
    expected: [
      { className: 'fixture__px-8 fixture__py-4', title: 'hidden', style: { display: 'flex' } },
      { contentClassName: 'fixture__hidden', 'aria-label': 'flex' },
    ],
  },
  {
    name: 'aliased cn and tv imports',
    code: `
import { cn as merge, tv as recipe } from '${helpersUrl}';
export const result = [merge('px-8', 'custom-widget'), recipe({ base: 'flex' })];`,
    expected: ['fixture__px-8 custom-widget', { base: 'fixture__flex' }],
  },
  {
    name: 'DOM class assignments and setAttribute',
    code: `
const element = { className: '', setAttribute(name, value) { this[name] = value; } };
element.className = 'px-8';
element.setAttribute('class', 'py-4');
element.setAttribute('title', 'hidden');
export const result = [element.className, element.class, element.title];`,
    expected: ['fixture__px-8', 'fixture__py-4', 'hidden'],
  },
  {
    name: 'nested arrays, computed object keys and shorthand keys',
    code: `
import { cn } from '${helpersUrl}';
const key = 'px-8';
const hidden = true;
export const result = cn(['flex', ['py-4', false]], { [key]: true, hidden, block: false });`,
    expected: 'fixture__flex fixture__py-4 fixture__px-8 fixture__hidden',
  },
  {
    name: 'conditional and logical expressions preserve conditions',
    code: `
const status = 'hidden';
const enabled = true;
const dynamic = undefined;
export const result = [
  { className: status === 'hidden' ? 'block' : 'hidden' },
  { className: enabled && 'flex' },
  { className: dynamic || 'px-8' },
  { className: dynamic ?? 'py-4' },
];`,
    expected: ['block', 'flex', 'px-8', 'py-4'].map((value) => ({
      className: `fixture__${value}`,
    })),
  },
  {
    name: 'constant references preserve declaration and other uses',
    code: `
const shared = 'flex';
const concatenated = 'px-' + '8';
const alias = shared;
export const result = [{ className: alias }, { className: concatenated }, { display: shared }];`,
    expected: [{ className: 'fixture__flex' }, { className: 'fixture__px-8' }, { display: 'flex' }],
  },
  {
    name: 'shadowed constants and reassigned values',
    code: `
const shared = 'flex';
const inner = () => { const shared = 'hidden'; return { className: shared }; };
let mutable = 'px-8';
mutable = 'custom-widget';
export const result = [{ className: shared }, inner(), { className: mutable }];`,
    expected: [
      { className: 'fixture__flex' },
      { className: 'fixture__hidden' },
      { className: 'custom-widget' },
    ],
  },
  {
    name: 'TypeScript assertions, satisfies and parenthesized expressions',
    code: `
export const result = [
  { className: 'px-8' as string },
  { className: 'py-4' satisfies string },
  { className: ('flex') },
];`,
    expected: ['px-8', 'py-4', 'flex'].map((value) => ({ className: `fixture__${value}` })),
  },
  {
    name: 'templates, escapes, whitespace and existing prefixes',
    code: String.raw`
const enabled = true;
export const result = [
  { className: \`px-8 \${enabled ? 'hidden' : 'block'} custom-widget\` },
  { className: 'px-8\tpy-4\nfixture__flex' },
  { className: "content-['a\"b']" },
  { className: \`flex\` },
];`
      .replaceAll('\\`', '`')
      .replaceAll('\\${', '${'),
    expected: [
      { className: 'fixture__px-8 fixture__hidden custom-widget' },
      { className: 'fixture__px-8\tfixture__py-4\nfixture__flex' },
      { className: "fixture__content-['a\"b']" },
      { className: 'fixture__flex' },
    ],
  },
  {
    name: 'tv slots and compound conditions',
    code: `
import { tv } from '${helpersUrl}';
export const result = tv({
  slots: { root: ['px-8', 'flex'], icon: 'text-sm' },
  variants: { state: { hidden: { root: 'hidden', icon: 'opacity-50' } } },
  defaultVariants: { state: 'hidden' },
  compoundVariants: [{ state: ['hidden', 'block'], className: { root: 'py-4' } }],
});`,
    expected: {
      slots: { root: ['fixture__px-8', 'fixture__flex'], icon: 'fixture__text-sm' },
      variants: { state: { hidden: { root: 'fixture__hidden', icon: 'fixture__opacity-50' } } },
      defaultVariants: { state: 'hidden' },
      compoundVariants: [{ state: ['hidden', 'block'], className: { root: 'fixture__py-4' } }],
    },
  },
  {
    name: 'compound assignments keep runtime values intact',
    code: `
let mutable = 'px-8';
mutable += ' custom-widget';
export const result = { className: mutable };`,
    expected: { className: 'px-8 custom-widget' },
  },
  {
    name: 'quoted class properties and recipe keys',
    code: `
import { tv } from '${helpersUrl}';
export const result = [{ 'className': 'px-8' }, tv({ 'base': 'flex', 'variants': { size: { small: 'text-sm' } } })];`,
    expected: [
      { className: 'fixture__px-8' },
      { base: 'fixture__flex', variants: { size: { small: 'fixture__text-sm' } } },
    ],
  },
  {
    name: 'class-like strings outside class contexts stay unchanged',
    code: `
const display = 'flex';
const status = 'hidden';
export const result = {
  title: 'px-8 py-4',
  style: { display },
  status,
  className: status === 'hidden' ? display : 'block',
};`,
    expected: {
      title: 'px-8 py-4',
      style: { display: 'flex' },
      status: 'hidden',
      className: 'fixture__flex',
    },
  },
  {
    name: 'tv compound slots preserve slot names and conditions',
    code: `
import { tv } from '${helpersUrl}';
export const result = tv({
  slots: { hidden: 'flex' },
  defaultVariants: { state: 'hidden' },
  compoundSlots: [{ slots: ['hidden'], state: 'hidden', class: ['px-8', 'py-4'] }],
});`,
    expected: {
      slots: { hidden: 'fixture__flex' },
      defaultVariants: { state: 'hidden' },
      compoundSlots: [
        { slots: ['hidden'], state: 'hidden', class: ['fixture__px-8', 'fixture__py-4'] },
      ],
    },
  },
  {
    name: 'unresolved runtime class values stay intact',
    code: `
const runtime = () => 'custom-widget';
const buildClass = size => 'custom-' + size;
export const result = [
  { className: runtime() }, { className: buildClass(8) },
  { className: 'custom-widget' }, { className: 'fixture__px-8' },
];`,
    expected: ['custom-widget', 'custom-8', 'custom-widget', 'fixture__px-8'].map((className) => ({
      className,
    })),
  },
];
