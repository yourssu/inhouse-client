#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { assertKnownOptions, parseArgs, requireOption } from './lib/args.mjs';

const readRegularJson = (filePath, label) => {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${label}은 symlink가 아닌 regular file이어야 합니다: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const assertStrictChild = (parent, candidate, label) => {
  const relative = path.relative(parent, candidate);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label}이 허용된 경계를 벗어납니다: ${candidate}`);
  }
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  assertKnownOptions(options, ['iteration']);
  const iterationDirectory = path.resolve(requireOption(options, 'iteration'));
  const manifestPath = path.join(iterationDirectory, 'manifest.json');
  const manifest = readRegularJson(manifestPath, 'manifest');
  if (
    typeof manifest.run_id !== 'string' ||
    !Array.isArray(manifest.sandboxes) ||
    manifest.sandboxes.length === 0 ||
    new Set(manifest.sandboxes).size !== manifest.sandboxes.length
  ) {
    throw new Error('manifest의 run_id 또는 sandbox 목록이 올바르지 않습니다.');
  }

  const sandboxRoot = path.resolve(manifest.sandbox_root);
  if (!fs.existsSync(sandboxRoot)) {
    if (manifest.sandboxes_cleaned === true) {
      console.log(`이미 정리됨: ${sandboxRoot}`);
      return;
    }
    throw new Error(`정리되지 않은 sandbox root가 없습니다: ${sandboxRoot}`);
  }
  if (fs.lstatSync(sandboxRoot).isSymbolicLink()) {
    throw new Error(`sandbox root에 symlink를 사용할 수 없습니다: ${sandboxRoot}`);
  }

  const allowedRoot = path.resolve(os.tmpdir(), 'repo-skill-benchmark');
  const realAllowedRoot = fs.realpathSync(allowedRoot);
  const realSandboxRoot = fs.realpathSync(sandboxRoot);
  assertStrictChild(realAllowedRoot, realSandboxRoot, 'sandbox root');
  const rootSegments = path.relative(realAllowedRoot, realSandboxRoot).split(path.sep);
  if (
    rootSegments.length !== 3 ||
    !/^[a-f0-9]{12}$/.test(rootSegments[0]) ||
    rootSegments[1] !== manifest.skill_name ||
    !rootSegments[2].endsWith(`-${manifest.run_id}`)
  ) {
    throw new Error(`sandbox root 구조가 runner 계약과 다릅니다: ${realSandboxRoot}`);
  }

  const runMarker = readRegularJson(
    path.join(realSandboxRoot, '.repo-skill-benchmark-run.json'),
    'run marker',
  );
  if (runMarker.owner !== 'repo-skill-benchmark' || runMarker.run_id !== manifest.run_id) {
    throw new Error(`run marker가 manifest와 일치하지 않습니다: ${realSandboxRoot}`);
  }

  const expectedNames = new Set();
  for (const sandboxPath of manifest.sandboxes) {
    const sandbox = path.resolve(sandboxPath);
    if (path.dirname(sandbox) !== sandboxRoot) {
      throw new Error(`manifest sandbox는 run root의 직접 자식이어야 합니다: ${sandbox}`);
    }
    expectedNames.add(path.basename(sandbox));
    if (!fs.existsSync(sandbox)) {
      continue;
    }
    if (fs.lstatSync(sandbox).isSymbolicLink()) {
      throw new Error(`sandbox에 symlink를 사용할 수 없습니다: ${sandbox}`);
    }
    const realSandbox = fs.realpathSync(sandbox);
    assertStrictChild(realSandboxRoot, realSandbox, 'manifest sandbox');
    if (path.dirname(realSandbox) !== realSandboxRoot) {
      throw new Error(`sandbox는 run root의 직접 자식이어야 합니다: ${realSandbox}`);
    }

    const markerPath = path.join(realSandbox, '.isolated-checkout');
    if (!fs.existsSync(markerPath) && manifest.status === 'failed') {
      continue;
    }
    const marker = readRegularJson(markerPath, 'sandbox marker');
    if (
      marker.owner !== 'repo-skill-benchmark' ||
      marker.run_id !== manifest.run_id ||
      marker.sandbox_id !== path.basename(realSandbox)
    ) {
      throw new Error(`sandbox marker가 일치하지 않습니다: ${realSandbox}`);
    }
  }

  const unexpectedEntries = fs
    .readdirSync(realSandboxRoot)
    .filter((entry) => entry !== '.repo-skill-benchmark-run.json' && !expectedNames.has(entry));
  if (unexpectedEntries.length > 0) {
    throw new Error(`run root에 manifest 밖 entry가 있습니다: ${unexpectedEntries.join(', ')}`);
  }

  fs.rmSync(realSandboxRoot, { recursive: true, force: true });
  manifest.sandboxes_cleaned = true;
  manifest.sandboxes_cleaned_at = new Date().toISOString();
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`sandbox 정리 완료: ${realSandboxRoot}`);
};

try {
  main();
} catch (error) {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
}