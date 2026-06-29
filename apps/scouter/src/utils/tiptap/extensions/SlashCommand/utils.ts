import type { Node, ResolvedPos } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';

import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { disassemble } from 'es-hangul';

import {
  inactiveSlashCommandState,
  type SlashCommandItem,
  type SlashCommandState,
  slashElementDataAttribute,
} from './type';

export const mapState = (prev: SlashCommandState, tr: Transaction): SlashCommandState => ({
  ...prev,
  decorationSet: prev.decorationSet.map(tr.mapping, tr.doc),
});

export const getSlashContext = ($from: ResolvedPos) => {
  /*
    NOTE: textContent는 Atom Node(ex. inlineVariable)의 내용을 포함하지 않거나 길이가 다를 수 있어,
    실제 문서 상의 위치(Pos)와 텍스트 인덱스가 달라지는 문제가 발생해요.
    leafText를 '\uFFFC'(Object Replacement Character)로 지정하여 Atom Node를 길이 1로 취급함으로써,
    텍스트 인덱스와 문서 오프셋을 1:1로 매핑하여 정확한 Range 계산을 보장하도록 했어요.
  */
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\uFFFC');
  const slashIndex = textBefore.lastIndexOf('/');

  const isSlashMissing = slashIndex === -1;
  const isPrecededByWord = slashIndex > 0 && /\w/.test(textBefore[slashIndex - 1]);
  const isPrecededBySlash = slashIndex > 0 && textBefore[slashIndex - 1] === '/';

  if (isSlashMissing || isPrecededByWord || isPrecededBySlash) {
    return null;
  }

  const isNewlyTyped = slashIndex === textBefore.length - 1;

  return {
    query: textBefore.slice(slashIndex + 1),
    startPos: $from.start() + slashIndex,
    endPos: $from.pos,
    isNewlyTyped,
  };
};

export const createActiveState = (
  context: NonNullable<ReturnType<typeof getSlashContext>>,
  allItems: SlashCommandItem[],
  prev: SlashCommandState,
  meta: any,
  doc: Node,
): SlashCommandState => {
  const { query, startPos, endPos } = context;

  if (/\s/.test(query)) {
    return inactiveSlashCommandState;
  }

  const filteredItems = query
    ? allItems.filter((item) => {
        const normalizedLabel = item.label.normalize('NFC');
        const normalizedQuery = query.normalize('NFC');
        const disassembledLabel = disassemble(normalizedLabel);
        const disassembledQuery = disassemble(normalizedQuery);
        return disassembledLabel.includes(disassembledQuery);
      })
    : allItems;

  const selectedIndex =
    meta?.selectedIndex ?? Math.min(prev.selectedIndex, Math.max(0, filteredItems.length - 1));

  const decorationSet = DecorationSet.create(doc, [
    Decoration.inline(startPos, endPos, {
      class: 'bg-greyOpacity100 text-greyOpacity800 rounded px-1 py-0.5',
      nodeName: 'span',
      [slashElementDataAttribute]: 'true',
    }),
  ]);

  return {
    active: true,
    query,
    range: { from: startPos, to: endPos },
    items: filteredItems,
    selectedIndex,
    decorationSet,
  };
};
