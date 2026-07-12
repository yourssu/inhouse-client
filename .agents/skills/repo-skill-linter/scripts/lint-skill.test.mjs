import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const linterPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'lint-skill.mjs');
const temporaryDirectories = [];

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result;
};

const createRepository = () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-skill-linter-'));
  temporaryDirectories.push(repoRoot);
  const skillDirectory = path.join(repoRoot, '.agents', 'skills', 'example-skill');
  fs.mkdirSync(path.join(skillDirectory, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(skillDirectory, 'evals'), { recursive: true });
  fs.writeFileSync(
    path.join(skillDirectory, 'SKILL.md'),
    [
      '---',
      'name: example-skill',
      'description: example repository skill',
      '---',
      '',
      '# Example',
      '',
      'Run `scripts/check.sh`.',
      '',
    ].join('\n'),
  );
  fs.writeFileSync(path.join(skillDirectory, 'scripts', 'check.sh'), '#!/usr/bin/env bash\ntrue\n');
  fs.writeFileSync(path.join(skillDirectory, 'evals', 'evals.json'), '{ invalid baseline json');

  run('git', ['init', '--quiet'], repoRoot);
  run('git', ['add', '.'], repoRoot);
  run(
    'git',
    [
      '-c',
      'user.name=Skill Linter Test',
      '-c',
      'user.email=skill-linter@example.com',
      'commit',
      '--quiet',
      '-m',
      'fixture',
    ],
    repoRoot,
  );
  return { repoRoot, skillDirectory };
};

const lint = (repoRoot, ...args) =>
  spawnSync(process.execPath, [linterPath, '--skill', '.agents/skills/example-skill', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('문서만 변경하면 기존 eval과 script를 다시 검사하지 않는다', () => {
  const { repoRoot, skillDirectory } = createRepository();
  fs.appendFileSync(path.join(skillDirectory, 'SKILL.md'), '\n문서 변경\n');

  const result = lint(repoRoot);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /변경 파일 1개 lint 성공/);
});

test('변경된 shell script의 문법 오류를 검출한다', () => {
  const { repoRoot, skillDirectory } = createRepository();
  fs.writeFileSync(path.join(skillDirectory, 'scripts', 'check.sh'), 'if then\n');

  const result = lint(repoRoot);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /shell 문법 검사/);
});

test('변경된 eval JSON의 parse 오류를 검출한다', () => {
  const { repoRoot, skillDirectory } = createRepository();
  fs.writeFileSync(path.join(skillDirectory, 'evals', 'evals.json'), '{ changed invalid json');

  const result = lint(repoRoot);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JSON/);
});

test('SKILL.md의 존재하지 않는 resource 참조를 검출한다', () => {
  const { repoRoot, skillDirectory } = createRepository();
  fs.appendFileSync(path.join(skillDirectory, 'SKILL.md'), '\nRun `scripts/missing.sh`.\n');

  const result = lint(repoRoot);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /존재하지 않는 skill resource/);
});

test('다른 저장소 스킬의 resource 경로를 로컬 참조로 오인하지 않는다', () => {
  const { repoRoot, skillDirectory } = createRepository();
  fs.appendFileSync(
    path.join(skillDirectory, 'SKILL.md'),
    '\nRun `.agents/skills/other-skill/scripts/check.mjs`.\n',
  );

  const result = lint(repoRoot);

  assert.equal(result.status, 0, result.stderr);
});