import { types as t, traverse } from '@babel/core';

import { type ClassValuePath, createClassContextAdapters } from './classContextAdapters.ts';
import { parseClassSource } from './parseClassSource';

interface ClassReference {
  end: number;
  serialize: (value: string) => string;
  start: number;
  value: string;
}

const serializeTemplate = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');

export const collectClassReferences = async (
  code: string,
  filename: string,
  resolveValue?: (path: ClassValuePath) => Promise<string | undefined>,
) => {
  const references = new Map<t.Node, ClassReference>();
  const pending: Promise<void>[] = [];

  const collect = (node: t.Node, value: string, serialize = JSON.stringify) => {
    if (node.start == null || node.end == null) {
      return;
    }

    references.set(node, { start: node.start, end: node.end, value, serialize });
  };

  const collectValue = (path: ClassValuePath): void => {
    if (path.isStringLiteral()) {
      collect(
        path.node,
        path.node.value,
        path.parentPath?.isJSXAttribute()
          ? (value) => `{${JSON.stringify(value)}}`
          : JSON.stringify,
      );
      return;
    }

    if (path.isTemplateLiteral()) {
      for (const quasi of path.node.quasis) {
        collect(quasi, quasi.value.cooked ?? quasi.value.raw, serializeTemplate);
      }

      path.get('expressions').forEach(collectValue);
      return;
    }

    if (path.isConditionalExpression()) {
      collectValue(path.get('consequent'));
      collectValue(path.get('alternate'));
      return;
    }

    if (path.isLogicalExpression()) {
      if (path.node.operator !== '&&') {
        collectValue(path.get('left'));
      }

      collectValue(path.get('right'));
      return;
    }

    if (path.isArrayExpression()) {
      path.get('elements').forEach(collectValue);
      return;
    }

    if (path.isObjectExpression()) {
      for (const property of path.get('properties')) {
        if (!property.isObjectProperty()) {
          continue;
        }

        const key = property.get('key');

        if (property.node.computed || key.isStringLiteral()) {
          collectValue(key);
          continue;
        }

        if (!key.isIdentifier()) {
          continue;
        }

        const name = key.node.name;

        collect(
          property.node.shorthand ? property.node : key.node,
          name,
          (value) => JSON.stringify(value) + (property.node.shorthand ? `: ${name}` : ''),
        );
      }
      return;
    }

    if (path.isIdentifier() || path.isMemberExpression() || path.isBinaryExpression()) {
      // Preserve shared declarations: replace only the reference used as a class value.
      const evaluated = path.evaluate();

      if (!evaluated.confident || typeof evaluated.value !== 'string') {
        if (resolveValue) {
          const node = path.node;

          pending.push(
            resolveValue(path).then((value) => {
              if (value !== undefined) {
                collect(node, value);
              }
            }),
          );
        }

        return;
      }

      collect(path.node, evaluated.value);
      return;
    }

    if (path.isTSAsExpression()) {
      collectValue(path.get('expression'));
      return;
    }

    if (path.isTSSatisfiesExpression()) {
      collectValue(path.get('expression'));
    }
  };

  const ast = parseClassSource(code, filename);

  if (!ast) {
    return [];
  }

  traverse(ast, traverse.visitors.merge(createClassContextAdapters(collectValue)));
  await Promise.all(pending);

  return [...references.values()];
};
