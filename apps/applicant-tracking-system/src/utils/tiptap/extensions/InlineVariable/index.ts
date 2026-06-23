import { mergeAttributes, Node } from '@tiptap/core';

import type { InlineVariableOptions } from './type';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineVariable: {
      setInlineVariable: (options: {
        id: string;
        isDifferentPerPerson?: boolean;
        label: string;
      }) => ReturnType;
    };
  }
}

export const InlineVariableExtension = Node.create<InlineVariableOptions>({
  name: 'inlineVariable',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('label'),
      },
      type: {
        default: 'text',
      },
      isDifferentPerPerson: {
        default: false,
        parseHTML: (element) => element.getAttribute('isDifferentPerPerson') === 'true',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inlineVariable"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const isDifferent = node.attrs.isDifferentPerPerson;
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `inline-flex items-center px-1.5 rounded-md ${
          isDifferent ? 'bg-teal50 text-teal600' : 'bg-violetOpacity50 text-violet600'
        } font-medium mx-0.5 text-sm`,
        'data-type': 'inlineVariable',
      }),
      String(node.attrs.label ?? ''),
    ];
  },

  addCommands() {
    return {
      setInlineVariable:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            attrs: attributes,
            type: this.name,
          });
        },
    };
  },
});
