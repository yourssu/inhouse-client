import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { type EditorView } from '@tiptap/pm/view';

import { executeInsertVariable, executeNavigation } from './actions';
import {
  inactiveSlashCommandState,
  type SlashCommandItem,
  slashCommandName,
  type SlashCommandOptions,
  slashCommandPluginKey,
  type SlashCommandState,
  type SlashCommandStorage,
} from './type';
import { createActiveState, getSlashContext, mapState } from './utils';

export * from './actions';
export * from './type';

const handleEnter = (view: EditorView, state: SlashCommandState) => {
  const item = state.items[state.selectedIndex];
  if (item && state.range) {
    executeInsertVariable(view, item, state.range);
  }
  return true;
};

export const SlashCommandExtension = Extension.create<SlashCommandOptions, SlashCommandStorage>({
  name: slashCommandName,

  addOptions() {
    return {
      items: () => [],
    };
  },

  addStorage() {
    return {
      items: this.options.items,
    };
  },

  addProseMirrorPlugins() {
    const getItems = (): SlashCommandItem[] => this.storage.items?.() ?? [];

    return [
      new Plugin<SlashCommandState>({
        key: slashCommandPluginKey,

        state: {
          init() {
            return inactiveSlashCommandState;
          },
          apply(tr, prev, _oldState, newState) {
            const meta = tr.getMeta(slashCommandPluginKey);

            if (meta?.deactivate) {
              return inactiveSlashCommandState;
            }

            if (!tr.docChanged && !meta) {
              return mapState(prev, tr);
            }

            const context = getSlashContext(newState.selection.$from);

            if (!context) {
              return inactiveSlashCommandState;
            }

            if (!prev.active) {
              if (!context.isNewlyTyped) {
                return inactiveSlashCommandState;
              }
              if (newState.selection.from <= _oldState.selection.from) {
                return inactiveSlashCommandState;
              }
            }

            return createActiveState(context, getItems(), prev, meta, newState.doc);
          },
        },

        props: {
          decorations(state) {
            return slashCommandPluginKey.getState(state)?.decorationSet;
          },
          handleKeyDown(view, event) {
            const state = slashCommandPluginKey.getState(view.state);

            if (!state?.active || state.items.length === 0) {
              return false;
            }

            switch (event.key) {
              case 'ArrowDown':
                event.preventDefault();
                executeNavigation(view, state, 'down');
                return true;
              case 'ArrowUp':
                event.preventDefault();
                executeNavigation(view, state, 'up');
                return true;
              case 'Enter':
                event.preventDefault();
                return handleEnter(view, state);
              case 'Tab':
                event.preventDefault();
                executeNavigation(view, state, event.shiftKey ? 'up' : 'down');
                return true;
              default:
                return false;
            }
          },
        },
      }),
    ];
  },
});
