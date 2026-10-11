import { type NodePath, types as t, type Visitor } from '@babel/core';

export type ClassValuePath = NodePath<null | t.Node | undefined>;

const classProperty = /^(?:class|.*className)$/i;
const classFunctions = new Set(['clsx', 'cn', 'cx', 'twMerge']);

const propertyName = (key: t.Node) =>
  t.isIdentifier(key) ? key.name : t.isStringLiteral(key) ? key.value : '';

export const createClassContextAdapters = (collectValue: (path: ClassValuePath) => void) => {
  const recipeProperties = new Set<t.ObjectProperty>();

  const collectRecord = (path: ClassValuePath): void => {
    if (!path.isObjectExpression()) {
      collectValue(path);
      return;
    }

    for (const property of path.get('properties')) {
      if (!property.isObjectProperty()) {
        continue;
      }

      collectRecord(property.get('value'));
    }
  };

  const collectRecipe = (path: ClassValuePath, compound = false): void => {
    if (!path.isObjectExpression()) {
      return;
    }

    for (const property of path.get('properties')) {
      if (!property.isObjectProperty()) {
        continue;
      }

      const name = propertyName(property.node.key);
      const value = property.get('value');

      if (!compound && name === 'base') {
        collectValue(value);
        continue;
      }

      if (
        ['class', 'className'].includes(name) ||
        (!compound && ['slots', 'variants'].includes(name))
      ) {
        recipeProperties.add(property.node);
        collectRecord(value);
        continue;
      }

      if (
        !compound &&
        ['compoundSlots', 'compoundVariants'].includes(name) &&
        value.isArrayExpression()
      ) {
        value.get('elements').forEach((entry) => collectRecipe(entry, true));
      }
    }
  };

  const classProps: Visitor = {
    JSXAttribute(path) {
      if (t.isJSXIdentifier(path.node.name) && classProperty.test(path.node.name.name)) {
        const value = path.get('value');

        collectValue(value.isJSXExpressionContainer() ? value.get('expression') : value);
      }
    },

    ObjectProperty(path) {
      if (
        !recipeProperties.has(path.node) &&
        !path.node.computed &&
        classProperty.test(propertyName(path.node.key))
      ) {
        collectValue(path.get('value'));
      }
    },
  };

  const domClasses: Visitor = {
    AssignmentExpression(path) {
      const left = path.node.left;

      if (t.isMemberExpression(left) && t.isIdentifier(left.property, { name: 'className' })) {
        collectValue(path.get('right'));
      }
    },

    CallExpression(path) {
      const callee = path.node.callee;

      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property, { name: 'setAttribute' }) &&
        t.isStringLiteral(path.node.arguments[0], { value: 'class' })
      ) {
        collectValue(path.get('arguments')[1]);
      }
    },
  };

  const classCalls: Visitor = {
    CallExpression(path) {
      const callee = path.node.callee;

      if (!t.isIdentifier(callee)) {
        return;
      }

      const binding = path.scope.getBinding(callee.name)?.path;
      const name =
        binding?.isImportSpecifier() && t.isIdentifier(binding.node.imported)
          ? binding.node.imported.name
          : callee.name;

      if (classFunctions.has(name)) {
        path.get('arguments').forEach(collectValue);
        return;
      }

      if (name === 'tv') {
        collectRecipe(path.get('arguments')[0]);
      }
    },
  };

  return [classProps, domClasses, classCalls];
};
