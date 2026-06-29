import { PluginKey } from '@tiptap/pm/state';
import { DecorationSet } from '@tiptap/pm/view';

export interface SlashCommandOptions {
  items: () => SlashCommandItem[];
}

export interface SlashCommandStorage {
  items: () => SlashCommandItem[];
}

export interface SlashCommandItem {
  id: string;
  isDifferentPerPerson?: boolean;
  label: string;
}

export interface SlashCommandState {
  active: boolean;
  decorationSet: DecorationSet;
  items: SlashCommandItem[];
  query: string;
  range: null | { from: number; to: number };
  selectedIndex: number;
}

export const slashElementDataAttribute = 'data-slash-element';
export const slashCommandName = 'slashCommand';
export const slashCommandPluginKey = new PluginKey<SlashCommandState>('slashCommand');

export const inactiveSlashCommandState: SlashCommandState = {
  active: false,
  decorationSet: DecorationSet.empty,
  items: [],
  query: '',
  range: null,
  selectedIndex: 0,
};
