import type { Editor } from '@tiptap/react';

import { assert } from 'es-toolkit';

export const getEditorStorage = <TStorage>(editor: Editor, extensionName: string) => {
  const storage = editor.storage as unknown as Record<string, unknown>;
  assert(!!storage[extensionName], `Storage(${extensionName}) 을 찾을 수 없어요.`);
  return storage[extensionName] as TStorage;
};
