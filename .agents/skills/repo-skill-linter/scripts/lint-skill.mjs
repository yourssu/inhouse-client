#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const usage = () => {
  console.error('사용법: lint-skill.mjs --skill <path> [--repo <path>] [--all]');
};

const parseArgs = (args) => {
  const options = { all: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--all') {
      options.all = true;
      continue;
    }
    if (argument === '--skill' || argument === '--repo') {
      const value = args[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error(`${argument} 값이 없습니다.`);
      }
      options[argument.slice(2)] = value;
      index += 1;
      continue;
    }
    if (argument === '--help' || argument === '-h') {
      usage();
      process.exit(0);
    }
    throw new Error(`알 수 없는 옵션: ${argument}`);
  }

  if (!options.skill) {
    throw new Error('--skill이 필요합니다.');
  }
  return options;
};

const run = (command, args, cwd, label) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.error) {
    throw new Error(`${label} 실행 실패: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr]
      .map((value) => value.trim())
      .filter(Boolean)
      .join('\n');
    throw new Error(`${label} 실패${detail ? `\n${detail}` : ''}`);
  }
  return result.stdout;
};

const resolveInside = (root, candidate, label) => {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolved);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return resolved;
  }
  throw new Error(`${label}이 저장소 밖을 가리킵니다: ${candidate}`);
};

const walkFiles = (directory) => {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`skill resource에 symlink를 사용할 수 없습니다: ${absolutePath}`);
    }
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }
  return files;
};

const splitNull = (value) => value.split('\0').filter(Boolean);

const changedPaths = (repoRoot, skillRelativePath) => {
  const tracked = splitNull(
    run(
      'git',
      ['diff', '--name-only', '--diff-filter=ACMRTUXB', '-z', 'HEAD', '--', skillRelativePath],
      repoRoot,
      '변경 파일 조회',
    ),
  );
  const untracked = splitNull(
    run(
      'git',
      ['ls-files', '--others', '--exclude-standard', '-z', '--', skillRelativePath],
      repoRoot,
      '추가 파일 조회',
    ),
  );
  const deleted = splitNull(
    run(
      'git',
      ['diff', '--name-only', '--diff-filter=D', '-z', 'HEAD', '--', skillRelativePath],
      repoRoot,
      '삭제 파일 조회',
    ),
  );
  return {
    existing: [...new Set([...tracked, ...untracked])].sort(),
    deleted: [...new Set(deleted)].sort(),
  };
};

const parseFrontmatter = (content) => {
  if (!content.startsWith('---\n')) {
    throw new Error('SKILL.md frontmatter가 없습니다.');
  }
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error('SKILL.md frontmatter가 닫히지 않았습니다.');
  }

  const fields = new Map();
  for (const line of content.slice(4, end).split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    fields.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  return fields;
};

const validateSkillDocument = (skillDirectory) => {
  const skillPath = path.join(skillDirectory, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    throw new Error(`SKILL.md가 없습니다: ${skillPath}`);
  }

  const content = fs.readFileSync(skillPath, 'utf8');
  const fields = parseFrontmatter(content);
  const name = fields.get('name');
  const description = fields.get('description');
  const directoryName = path.basename(skillDirectory);

  if (!name || !/^[a-z0-9-]{1,64}$/.test(name)) {
    throw new Error(`skill name이 kebab-case가 아닙니다: ${name ?? '(없음)'}`);
  }
  if (name !== directoryName) {
    throw new Error(`skill name과 디렉터리 이름이 다릅니다: ${name} !==${directoryName}`);
  }
  if (!description) {
    throw new Error('SKILL.md description이 비어 있습니다.');
  }

  const resourcePattern = /(?<![a-zA-Z0-9_./-])(?:references|scripts|assets)\/[a-zA-Z0-9_./-]+/g;
  for (const resource of new Set(content.match(resourcePattern) ?? [])) {
    const resourcePath = resolveInside(
      skillDirectory,
      path.join(skillDirectory, resource),
      resource,
    );
    if (!fs.existsSync(resourcePath)) {
      throw new Error(`존재하지 않는 skill resource: ${resource}`);
    }
  }
};

const textExtensions = new Set([
  '.cjs',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.py',
  '.sh',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);

const validatePortableText = (filePath, relativePath) => {
  if (!textExtensions.has(path.extname(filePath))) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (/(?:\/Users\/[a-z0-9_.-]+)/i.test(content) || /C:\\Users\\[^\\]+/i.test(content)) {
    throw new Error(`사용자 홈 절대 경로가 포함되어 있습니다: ${relativePath}`);
  }
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(
    options.repo ??
      run('git', ['rev-parse', '--show-toplevel'], process.cwd(), '저장소 조회').trim(),
  );
  const skillDirectory = resolveInside(
    repoRoot,
    path.resolve(repoRoot, options.skill),
    '대상 skill',
  );
  if (!fs.existsSync(skillDirectory) || !fs.statSync(skillDirectory).isDirectory()) {
    throw new Error(`대상 skill directory가 없습니다: ${skillDirectory}`);
  }

  const skillRelativePath = path.relative(repoRoot, skillDirectory).replaceAll(path.sep, '/');
  validateSkillDocument(skillDirectory);

  const selection = options.all
    ? {
        existing: walkFiles(skillDirectory).map((filePath) =>
          path.relative(repoRoot, filePath).replaceAll(path.sep, '/'),
        ),
        deleted: [],
      }
    : changedPaths(repoRoot, skillRelativePath);

  for (const relativePath of selection.existing) {
    const absolutePath = resolveInside(repoRoot, relativePath, relativePath);
    if (!fs.existsSync(absolutePath)) continue;

    validatePortableText(absolutePath, relativePath);
    const extension = path.extname(absolutePath);
    if (extension === '.json') {
      JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    } else if (extension === '.sh') {
      run('bash', ['-n', absolutePath], repoRoot, `shell 문법 검사 (${relativePath})`);
    } else if (['.js', '.mjs', '.cjs'].includes(extension)) {
      run(
        process.execPath,
        ['--check', absolutePath],
        repoRoot,
        `Node 문법 검사 (${relativePath})`,
      );
    }
  }

  const evalChanged =
    options.all ||
    [...selection.existing, ...selection.deleted].some((filePath) =>
      filePath.startsWith(`${skillRelativePath}/evals/`),
    );
  const evalsPath = path.join(skillDirectory, 'evals', 'evals.json');
  if (evalChanged && fs.existsSync(evalsPath)) {
    const validatorPath = path.join(
      repoRoot,
      '.agents/skills/repo-skill-benchmark/scripts/validate-evals.mjs',
    );
    if (!fs.existsSync(validatorPath)) {
      throw new Error(`eval validator가 없습니다: ${validatorPath}`);
    }
    run(
      process.execPath,
      [validatorPath, '--repo', repoRoot, '--skill', skillRelativePath],
      repoRoot,
      'eval schema 검사',
    );
  }

  const scope = options.all ? '전체' : '변경';
  console.log(
    `${path.basename(skillDirectory)}: ${scope} 파일 ${selection.existing.length}개 lint 성공`,
  );
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}