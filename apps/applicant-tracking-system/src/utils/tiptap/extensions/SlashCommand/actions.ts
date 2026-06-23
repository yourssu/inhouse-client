import type { EditorView } from '@tiptap/pm/view';

import { type SlashCommandItem, slashCommandPluginKey, type SlashCommandState } from './type';

export const executeNavigation = (
  view: EditorView,
  state: SlashCommandState,
  direction: 'down' | 'up',
) => {
  const itemLength = state.items.length;
  if (itemLength === 0) {
    return;
  }

  const diff = direction === 'up' ? -1 : 1;
  const newIndex = (state.selectedIndex + diff + itemLength) % itemLength;

  view.dispatch(view.state.tr.setMeta(slashCommandPluginKey, { selectedIndex: newIndex }));
};

export const executeInsertVariable = (
  view: EditorView,
  item: SlashCommandItem,
  range: { from: number; to: number },
) => {
  const node = view.state.schema.nodes.inlineVariable.create({
    id: item.id,
    label: item.label,
    isDifferentPerPerson: item.isDifferentPerPerson ?? false,
  });
  const tr = view.state.tr.replaceWith(range.from, range.to, node);
  tr.setMeta(slashCommandPluginKey, { deactivate: true });
  view.dispatch(tr);
};

export const executeDeactivateSlash = (view: EditorView) => {
  const tr = view.state.tr;
  tr.setMeta(slashCommandPluginKey, { deactivate: true });
  view.dispatch(tr);
};
