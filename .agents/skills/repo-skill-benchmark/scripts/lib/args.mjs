import path from 'node:path';

const booleanOptions = new Set(['help', 'require-grading', 'skip-setup', 'unsafe-bypass-sandbox']);

export const parseArgs = (argv) => {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      throw new Error(`알 수 없는 인자: ${token}`);
    }

    const name = token.slice(2);
    if (booleanOptions.has(name)) {
      options[name] = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('-')) {
      throw new Error(`--${token} 값이 필요합니다.`);
    }

    options[name] = value;
    index += 1;
  }

  return options;
};

export const assertKnownOptions = (options, allowedNames) => {
  const allowed = new Set(allowedNames);
  const unknown = Object.keys(options).filter((name) => !allowed.has(name));
  if (unknown.length > 0) {
    throw new Error(`알 수 없는 option: ${unknown.map((name) => `--${name}`).join(', ')}`);
  }
};

export const requireOption = (options, name) => {
  const value = options[name];
  if (!value) {
    throw new Error(`--${name} 옵션이 필요합니다.`);
  }
  return value;
};

export const parsePositiveInteger = (value, fallback, name) => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`--${name}은 양의 정수여야 합니다: ${value}`);
  }
  return parsed;
};

export const resolveInside = (baseDirectory, candidate, label) => {
  const resolvedBase = path.resolve(baseDirectory);
  const resolved = path.resolve(resolvedBase, candidate);
  const relative = path.relative(resolvedBase, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label}이 허용된 경계를 벗어납니다: ${candidate}`);
  }

  return resolved;
};

export const toRepoRelativePath = (repoRoot, absolutePath, label) => {
  const relative = path.relative(repoRoot, absolutePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label}은 저장소 내부여야 합니다: ${absolutePath}`);
  }
  return relative;
};