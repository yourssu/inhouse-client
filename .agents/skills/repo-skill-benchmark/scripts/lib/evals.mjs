import fs from 'node:fs';
import path from 'node:path';

import { resolveInside } from './args.mjs';
import { runSync } from './command.mjs';

const slugify = (value) => {
  const slug = value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);

  return slug || 'case';
};

const readSkillName = (skillDirectory) => {
  const content = fs.readFileSync(path.join(skillDirectory, 'SKILL.md'), 'utf8');
  const match = content.match(/^name:\s*([^\n]+)$/m);
  if (!match) {
    throw new Error(`${skillDirectory}/SKILL.md에 name이 없습니다.`);
  }
  return match[1].trim();
};

const validateString = (value, label) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label}은 비어 있지 않은 문자열이어야 합니다.`);
  }
};

const normalizeRepositoryPath = (value, label) => {
  validateString(value, label);
  if (path.isAbsolute(value)) {
    throw new Error(`${label}은 상대 경로여야 합니다: ${value}`);
  }

  const normalized = path.posix.normalize(value.replaceAll(path.sep, '/'));
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`${label}이 허용된 경계를 벗어납니다: ${value}`);
  }

  return normalized;
};

const assertRegularFileInside = ({ candidate, root, label }) => {
  if (!fs.existsSync(candidate)) {
    throw new Error(`${label}이 없습니다: ${candidate}`);
  }

  const lexicalPath = path.resolve(candidate);
  const lexicalRoot = path.resolve(root);
  const realRoot = fs.realpathSync(root);
  const realPath = fs.realpathSync(candidate);
  const relative = path.relative(realRoot, realPath);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label}이 대상 skill 내부의 파일이 아닙니다: ${candidate}`);
  }

  const expectedRealPath = path.resolve(realRoot, path.relative(lexicalRoot, lexicalPath));
  if (realPath !== expectedRealPath || fs.lstatSync(candidate).isSymbolicLink()) {
    throw new Error(`${label}에 symlink를 사용할 수 없습니다: ${candidate}`);
  }

  if (!fs.statSync(candidate).isFile()) {
    throw new Error(`${label}은 regular file이어야 합니다: ${candidate}`);
  }

  return realPath;
};

const fixtureTouchedPaths = (fixturePatch) => {
  const output = runSync('git', ['apply', '--numstat', '-z', fixturePatch]).stdout;
  const records = output.split('\0').filter((record) => record.length > 0);
  const touched = [];

  for (const record of records) {
    const firstTab = record.indexOf('\t');
    const secondTab = record.indexOf('\t', firstTab + 1);
    const filePath = secondTab === -1 ? '' : record.slice(secondTab + 1);
    if (firstTab === -1 || secondTab === -1 || filePath.length === 0) {
      throw new Error(
        `fixture patch의 rename 또는 해석할 수 없는 path는 지원하지 않습니다: ${fixturePatch}`,
      );
    }
    touched.push(normalizeRepositoryPath(filePath, 'fixture touched path'));
  }

  if (touched.length === 0) {
    throw new Error(`fixture patch가 어떤 파일도 변경하지 않습니다: ${fixturePatch}`);
  }
  return [...new Set(touched)].sort();
};

export const loadEvaluations = ({ skillDirectory, evalsPath, selectedIds }) => {
  const data = JSON.parse(fs.readFileSync(evalsPath, 'utf8'));
  const skillName = readSkillName(skillDirectory);

  if (!/^[a-z0-9-]+$/.test(skillName)) {
    throw new Error(`skill name이 kebab-case가 아닙니다: ${skillName}`);
  }

  if (data.skill_name !== skillName || !Array.isArray(data.evals) || data.evals.length === 0) {
    throw new Error('evals.json의 skill_name 또는 evals가 올바르지 않습니다.');
  }

  const ids = new Set();
  const evaluations = data.evals.map((evaluation) => {
    if (!Number.isInteger(evaluation.id) || evaluation.id <= 0 || ids.has(evaluation.id)) {
      throw new Error(`중복되거나 잘못된 eval id: ${evaluation.id}`);
    }
    ids.add(evaluation.id);

    validateString(evaluation.prompt, `eval ${evaluation.id} prompt`);
    validateString(evaluation.expected_output, `eval ${evaluation.id} expected_output`);

    const files = evaluation.files ?? [];
    if (!Array.isArray(files) || files.some((file) => typeof file !== 'string')) {
      throw new Error(`eval ${evaluation.id} files가 문자열 배열이 아닙니다.`);
    }

    if (
      !Array.isArray(evaluation.expectations) ||
      evaluation.expectations.length === 0 ||
      evaluation.expectations.some((expectation) => typeof expectation !== 'string')
    ) {
      throw new Error(`eval ${evaluation.id} expectations가 올바르지 않습니다.`);
    }

    const name = slugify(evaluation.name ?? evaluation.prompt);
    const resolvedFiles = files.map((file) => {
      const normalized = normalizeRepositoryPath(file, `eval ${evaluation.id} file`);
      const candidate = resolveInside(skillDirectory, normalized, `eval ${evaluation.id} file`);
      const source = assertRegularFileInside({
        candidate,
        root: skillDirectory,
        label: `eval ${evaluation.id} input file`,
      });
      const evalDirectory = fs.realpathSync(path.dirname(evalsPath));
      const relativeToEvalDirectory = path.relative(evalDirectory, source);
      if (
        relativeToEvalDirectory === '' ||
        (!relativeToEvalDirectory.startsWith('..') && !path.isAbsolute(relativeToEvalDirectory))
      ) {
        throw new Error(
          `eval ${evaluation.id} files에는 eval spec directory의 파일을 넣을 수 없습니다.`,
        );
      }
      return { source, relative: normalized };
    });

    let fixturePatch;
    let touchedPaths = [];
    if (evaluation.fixture_patch !== undefined) {
      const normalized = normalizeRepositoryPath(
        evaluation.fixture_patch,
        `eval ${evaluation.id} fixture_patch`,
      );
      const candidate = resolveInside(
        skillDirectory,
        normalized,
        `eval ${evaluation.id} fixture_patch`,
      );
      fixturePatch = assertRegularFileInside({
        candidate,
        root: skillDirectory,
        label: `eval ${evaluation.id} fixture patch`,
      });
      touchedPaths = fixtureTouchedPaths(fixturePatch);
    }

    const rawPreservePaths = evaluation.preserve_paths ?? [];
    if (!Array.isArray(rawPreservePaths)) {
      throw new Error(`eval ${evaluation.id} preserve_paths가 올바르지 않습니다.`);
    }
    const preservePaths = rawPreservePaths.map((preservePath) =>
      normalizeRepositoryPath(preservePath, `eval ${evaluation.id} preserve path`),
    );
    const preserveSet = new Set(preservePaths);
    const uncoveredFixturePaths = touchedPaths.filter(
      (touchedPath) => !preserveSet.has(touchedPath),
    );
    if (uncoveredFixturePaths.length > 0) {
      throw new Error(
        `eval ${evaluation.id} fixture가 변경하는 모든 path를 preserve_paths에 넣어야 합니다: ${uncoveredFixturePaths.join(', ')}`,
      );
    }

    let serialResetCommand = null;
    if (evaluation.serial_reset_command !== undefined) {
      validateString(evaluation.serial_reset_command, `eval ${evaluation.id} serial_reset_command`);
      if (evaluation.parallel_safe !== false) {
        throw new Error(
          `eval ${evaluation.id} serial_reset_command는 parallel_safe=false일 때만 사용합니다.`,
        );
      }
      serialResetCommand = evaluation.serial_reset_command;
    }

    return {
      id: evaluation.id,
      name,
      directory: `eval-${evaluation.id}-${name}`,
      prompt: evaluation.prompt,
      expectedOutput: evaluation.expected_output,
      expectations: evaluation.expectations,
      files: resolvedFiles,
      fixturePatch,
      fixturePatchLabel: evaluation.fixture_patch,
      fixtureTouchedPaths: touchedPaths,
      preservePaths,
      parallelSafe: evaluation.parallel_safe !== false,
      serialResetCommand,
    };
  });

  if (!selectedIds) {
    return { skillName, evaluations };
  }

  const selected = evaluations.filter((evaluation) => selectedIds.has(evaluation.id));
  const missing = [...selectedIds].filter(
    (id) => !selected.some((evaluation) => evaluation.id === id),
  );
  if (missing.length > 0) {
    throw new Error(`존재하지 않는 eval id: ${missing.join(', ')}`);
  }

  return { skillName, evaluations: selected };
};