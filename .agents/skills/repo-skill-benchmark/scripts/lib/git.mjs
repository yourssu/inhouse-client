import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { runSync } from './command.mjs';

export const git = (cwd, args, options) => runSync('git', ['-C', cwd, ...args], options);

export const gitText = (cwd, args) => git(cwd, args).stdout.trim();

export const gitStatus = (cwd) => git(cwd, ['status', '--short']).stdout;

export const diffFromCommit = (cwd, commit) => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-skill-benchmark-index-'));
  const temporaryIndex = path.join(temporaryDirectory, 'index');
  const env = { GIT_INDEX_FILE: temporaryIndex };

  try {
    git(cwd, ['read-tree', commit], { env });
    git(cwd, ['add', '-A', '.', ''], { env });
    return git(cwd, ['diff', '--cached', '--binary', commit], { env }).stdout;
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
};