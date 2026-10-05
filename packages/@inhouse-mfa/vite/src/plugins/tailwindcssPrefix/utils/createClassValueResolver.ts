import { type NodePath, types as t, traverse } from '@babel/core';

import type { ClassValuePath } from './classContextAdapters';

import { parseClassSource } from './parseClassSource';

type ResolveModule = (source: string, importer: string) => Promise<string | undefined>;

const exportName = (node: t.Identifier | t.StringLiteral) =>
  t.isIdentifier(node) ? node.name : node.value;

export const createClassValueResolver = (
  loadModule: (filename: string) => Promise<string | undefined>,
) => {
  const modules = new Map<string, Promise<NodePath<t.Program> | undefined>>();

  const loadProgram = (filename: string) => {
    const cached = modules.get(filename);

    if (cached) {
      return cached;
    }

    const loaded = loadModule(filename).then((code) => {
      if (code === undefined) {
        return;
      }

      const ast = parseClassSource(code, filename);
      let program: NodePath<t.Program> | undefined;

      if (ast) {
        traverse(ast, {
          Program(path) {
            program = path;
            path.stop();
          },
        });
      }

      return program;
    });

    modules.set(filename, loaded);
    return loaded;
  };

  const resolveValue = async (
    path: ClassValuePath,
    filename: string,
    resolveModule: ResolveModule,
    seen: ReadonlySet<t.Node>,
  ): Promise<string | undefined> => {
    if (!path.node || seen.has(path.node)) {
      return;
    }

    const visited = new Set(seen).add(path.node);
    const evaluated = path.evaluate();

    if (evaluated.confident && typeof evaluated.value === 'string') {
      return evaluated.value;
    }

    if (path.isIdentifier()) {
      const binding = path.scope.getBinding(path.node.name);

      if (!binding?.constant) {
        return;
      }

      if (binding.path.isVariableDeclarator()) {
        return resolveValue(binding.path.get('init'), filename, resolveModule, visited);
      }

      if (binding.path.isImportSpecifier() || binding.path.isImportDefaultSpecifier()) {
        const declaration = binding.path.parentPath;

        if (!declaration.isImportDeclaration()) {
          return;
        }

        const name = binding.path.isImportSpecifier()
          ? exportName(binding.path.node.imported)
          : 'default';

        return resolveExport(declaration.node.source.value, filename, name, resolveModule, visited);
      }

      return;
    }

    if (path.isMemberExpression() && t.isIdentifier(path.node.object)) {
      const binding = path.scope.getBinding(path.node.object.name)?.path;
      const property = path.node.property;
      const name =
        !path.node.computed && t.isIdentifier(property)
          ? property.name
          : t.isStringLiteral(property)
            ? property.value
            : undefined;

      if (!binding?.isImportNamespaceSpecifier() || name === undefined) {
        return;
      }

      const declaration = binding.parentPath;

      if (declaration.isImportDeclaration()) {
        return resolveExport(declaration.node.source.value, filename, name, resolveModule, visited);
      }

      return;
    }

    if (path.isBinaryExpression({ operator: '+' })) {
      const [left, right] = await Promise.all([
        resolveValue(path.get('left'), filename, resolveModule, visited),
        resolveValue(path.get('right'), filename, resolveModule, visited),
      ]);

      return left !== undefined && right !== undefined ? left + right : undefined;
    }

    if (path.isTemplateLiteral()) {
      const values = await Promise.all(
        path
          .get('expressions')
          .map((expression) => resolveValue(expression, filename, resolveModule, visited)),
      );

      if (values.some((value) => value === undefined)) {
        return;
      }

      return path.node.quasis
        .map((quasi, index) => (quasi.value.cooked ?? quasi.value.raw) + (values[index] ?? ''))
        .join('');
    }

    if (path.isTSAsExpression()) {
      return resolveValue(path.get('expression'), filename, resolveModule, visited);
    }

    if (path.isTSSatisfiesExpression()) {
      return resolveValue(path.get('expression'), filename, resolveModule, visited);
    }
  };

  const resolveExport = async (
    source: string,
    importer: string,
    name: string,
    resolveModule: ResolveModule,
    seen: ReadonlySet<t.Node>,
  ): Promise<string | undefined> => {
    const filename = await resolveModule(source, importer);
    const program = filename ? await loadProgram(filename) : undefined;

    if (!filename || !program) {
      return;
    }

    const body = program.get('body');

    for (const statement of body) {
      if (statement.isExportDefaultDeclaration() && name === 'default') {
        return resolveValue(statement.get('declaration'), filename, resolveModule, seen);
      }

      if (!statement.isExportNamedDeclaration()) {
        continue;
      }

      for (const specifier of statement.get('specifiers')) {
        if (!specifier.isExportSpecifier() || exportName(specifier.node.exported) !== name) {
          continue;
        }

        if (statement.node.source) {
          if (seen.has(statement.node)) {
            return;
          }

          return resolveExport(
            statement.node.source.value,
            filename,
            exportName(specifier.node.local),
            resolveModule,
            new Set(seen).add(statement.node),
          );
        }

        return resolveValue(specifier.get('local'), filename, resolveModule, seen);
      }

      const declaration = statement.get('declaration');

      if (!declaration.isVariableDeclaration()) {
        continue;
      }

      for (const variable of declaration.get('declarations')) {
        const identifier = variable.get('id');

        if (identifier.isIdentifier({ name })) {
          return resolveValue(identifier, filename, resolveModule, seen);
        }
      }
    }

    if (name === 'default') {
      return;
    }

    for (const statement of body) {
      if (!statement.isExportAllDeclaration() || seen.has(statement.node)) {
        continue;
      }

      const value = await resolveExport(
        statement.node.source.value,
        filename,
        name,
        resolveModule,
        new Set(seen).add(statement.node),
      );

      if (value !== undefined) {
        return value;
      }
    }
  };

  return {
    resolveValue: (path: ClassValuePath, filename: string, resolveModule: ResolveModule) =>
      resolveValue(path, filename, resolveModule, new Set()),
    invalidate: (filename: string) => {
      const loaded = modules.has(filename);

      if (loaded) {
        modules.clear();
      }

      return loaded;
    },
  };
};
