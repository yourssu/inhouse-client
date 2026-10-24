// 선언 내용을 바꾸지 않고 스키마의 순서를 유지한 채 타입 선언만 파일 끝으로 옮깁니다.
import { readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';

export const sortGeneratedTypes = async (paths: unknown) => {
  if (!Array.isArray(paths) || !paths.every((path: unknown) => typeof path === 'string')) {
    throw new Error('생성 파일 경로 목록이 필요합니다.');
  }
  await Promise.all(
    paths
      .filter((path) => path.endsWith('.gen.ts'))
      .map(async (path) => {
        const text = await readFile(path, 'utf8');
        const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
        const isType = (node: ts.Statement) =>
          ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node);
        const declarations = [
          ...source.statements.filter((node) => !isType(node)),
          ...source.statements.filter(isType),
        ];
        const sorted =
          declarations.map((node) => node.getFullText(source)).join('') +
          source.endOfFileToken.getFullText(source);
        if (sorted !== text) {
          await writeFile(path, sorted);
        }
      }),
  );
};
