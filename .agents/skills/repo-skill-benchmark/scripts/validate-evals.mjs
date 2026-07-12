#!/usr/bin/env node

import path from 'node:path';

import { assertKnownOptions, parseArgs, requireOption, toRepoRelativePath } from './lib/args.mjs';
import { runSync } from './lib/command.mjs';
import { loadEvaluations } from './lib/evals.mjs';

const options = parseArgs(process.argv.slice(2));
assertKnownOptions(options, ['repo', 'skill', 'evals']);
const repoRoot = path.resolve(
  options.repo ?? runSync('git', ['rev-parse', '--show-toplevel']).stdout.trim(),
);
const skillDirectory = path.resolve(repoRoot, requireOption(options, 'skill'));
const skillRelativePath = toRepoRelativePath(repoRoot, skillDirectory, 'target skill');
const evalsPath = path.resolve(
  repoRoot,
  options.evals ?? path.join(skillRelativePath, 'evals', 'evals.json'),
);
toRepoRelativePath(repoRoot, evalsPath, 'evals.json');

const { evaluations, skillName } = loadEvaluations({
  skillDirectory,
  evalsPath,
  selectedIds: null,
});
console.log(`${skillName}: ${evaluations.length}개 eval schema 검증 성공`);