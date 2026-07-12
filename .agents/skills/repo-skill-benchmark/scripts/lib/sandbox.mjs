import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { runLoggedProcess, runSync } from './command.mjs';
import { diffFromCommit, git, gitStatus, gitText } from './git.mjs';

const benchmarkSkillRelativePath = '.agents/skills/repo-skill-benchmark';

const copyDirectory = (source, destination) => {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, dereference: false });
};

const listFiles = (directory, prefix = '') => {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relativePath = path.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath, relativePath));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
};

export const hashBuffer = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

export const hashFile = (filePath) => hashBuffer(fs.readFileSync(filePath));

export const hashDirectory = (directory) => {
  const hash = crypto.createHash('sha256');
  for (const relativePath of listFiles(directory)) {
    const absolutePath = path.join(directory, relativePath);
    const stat = fs.lstatSync(absolutePath);
    hash.update(relativePath);
    hash.update('\0');
    hash.update(`mode:${stat.mode & 0o777}`);
    hash.update('\0');
    if (stat.isSymbolicLink()) {
      hash.update(`symlink:${fs.readlinkSync(absolutePath)}`);
    } else {
      hash.update(fs.readFileSync(absolutePath));
    }
    hash.update('\0');
  }
  return hash.digest('hex');
};

const hashPath = (sandbox, relativePath) => {
  const absolutePath = path.resolve(sandbox, relativePath);
  const relative = path.relative(sandbox, absolutePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`preserve path가 sandbox를 벗어납니다: ${relativePath}`);
  }
  if (!fs.existsSync(absolutePath)) {
    return { path: relativePath, exists: false, sha256: null };
  }

  const stat = fs.lstatSync(absolutePath);
  const sha256 = stat.isDirectory()
    ? hashDirectory(absolutePath)
    : stat.isSymbolicLink()
      ? hashBuffer(Buffer.from(`symlink:${fs.readlinkSync(absolutePath)}`))
      : hashFile(absolutePath);
  return { path: relativePath, exists: true, sha256 };
};

const sanitizeSkillSnapshot = (snapshotDirectory) => {
  fs.rmSync(path.join(snapshotDirectory, 'evals'), { recursive: true, force: true });
};

const copyWorkingTreeSkill = ({ destination, repoRoot, skillRelativePath }) => {
  const repositoryPaths = git(repoRoot, [
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '-z',
    '--',
    skillRelativePath,
  ])
    .stdout.split('\0')
    .filter(Boolean);

  fs.mkdirSync(destination, { recursive: true });
  for (const repositoryPath of repositoryPaths) {
    const source = path.join(repoRoot, repositoryPath);
    let stat;
    try {
      stat = fs.lstatSync(source);
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
    const relativePath = path.relative(skillRelativePath, repositoryPath);
    if (relativePath === '' || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new Error(`working skill file이 target 경계를 벗어납니다: ${repositoryPath}`);
    }
    const target = path.join(destination, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (stat.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(source), target);
    } else if (stat.isFile()) {
      fs.copyFileSync(source, target);
      fs.chmodSync(target, stat.mode & 0o777);
    } else {
      throw new Error(`working skill에는 file 또는 symlink만 허용됩니다: ${repositoryPath}`);
    }
  }
};

const extractSkillArchive = ({
  archivePath,
  controllerDirectory,
  destination,
  skillRelativePath,
}) => {
  const extractDirectory = fs.mkdtempSync(path.join(controllerDirectory, 'extract-'));
  try {
    runSync('tar', ['-xf', archivePath, '-C', extractDirectory]);
    const extractedSkill = path.join(extractDirectory, skillRelativePath);
    if (!fs.existsSync(path.join(extractedSkill, 'SKILL.md'))) {
      throw new Error(`snapshot에 SKILL.md가 없습니다: ${skillRelativePath}`);
    }
    copyDirectory(extractedSkill, destination);
    sanitizeSkillSnapshot(destination);
  } finally {
    fs.rmSync(extractDirectory, { recursive: true, force: true });
    fs.rmSync(archivePath, { force: true });
  }
};

const createSnapshotArchive = (snapshotDirectory, archivePath) => {
  runSync('tar', ['-czf', archivePath, '-C', snapshotDirectory, '.']);
  const buffer = fs.readFileSync(archivePath);
  fs.rmSync(archivePath, { force: true });
  return buffer;
};

export const prepareControllerMaterials = ({
  repoRoot,
  skillRelativePath,
  sourceRef,
  baselineRef,
  sandboxRoot,
}) => {
  const controllerDirectory = path.join(sandboxRoot, '_controller');
  fs.mkdirSync(controllerDirectory, { recursive: true });

  const sourceSha = gitText(repoRoot, [
    'rev-parse',
    '--verify',
    '--end-of-options',
    `${sourceRef}^{commit}`,
  ]);
  const baselineSha = gitText(repoRoot, [
    'rev-parse',
    '--verify',
    '--end-of-options',
    `${baselineRef}^{commit}`,
  ]);
  git(repoRoot, ['cat-file', '-e', `${baselineSha}:${skillRelativePath}/SKILL.md`]);

  const sourceArchive = path.join(controllerDirectory, 'source.tar');
  git(repoRoot, ['archive', '--format=tar', `--output=${sourceArchive}`, sourceSha]);

  const withSkillSnapshot = path.join(controllerDirectory, 'with-skill');
  copyWorkingTreeSkill({
    destination: withSkillSnapshot,
    repoRoot,
    skillRelativePath,
  });
  if (!fs.existsSync(path.join(withSkillSnapshot, 'SKILL.md'))) {
    throw new Error(`current snapshot에 SKILL.md가 없습니다: ${skillRelativePath}`);
  }
  sanitizeSkillSnapshot(withSkillSnapshot);

  const oldArchive = path.join(controllerDirectory, 'old-skill.tar');
  git(repoRoot, [
    'archive',
    '--format=tar',
    `--output=${oldArchive}`,
    baselineSha,
    '--',
    skillRelativePath,
  ]);
  const oldSkillSnapshot = path.join(controllerDirectory, 'old-skill');
  extractSkillArchive({
    archivePath: oldArchive,
    controllerDirectory,
    destination: oldSkillSnapshot,
    skillRelativePath,
  });

  const snapshots = {
    with_skill: withSkillSnapshot,
    old_skill: oldSkillSnapshot,
  };
  const snapshotHashes = Object.fromEntries(
    Object.entries(snapshots).map(([configuration, snapshot]) => [
      configuration,
      hashDirectory(snapshot),
    ]),
  );
  const snapshotArchives = Object.fromEntries(
    Object.entries(snapshots).map(([configuration, snapshot]) => [
      configuration,
      createSnapshotArchive(snapshot, path.join(controllerDirectory, `${configuration}.tar.gz`)),
    ]),
  );

  return {
    controllerDirectory,
    sourceArchive,
    sourceSha,
    baselineSha,
    snapshots,
    snapshotHashes,
    snapshotArchives,
  };
};

const copyInputFiles = ({ evaluation, sandbox }) => {
  const copied = [];

  evaluation.files.forEach((file, index) => {
    const destination = path.join(
      sandbox,
      '.benchmark-inputs',
      String(evaluation.id),
      `${index}-${path.basename(file.relative)}`,
    );
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(file.source, destination);
    copied.push(path.relative(sandbox, destination));
  });

  return copied;
};

const initializeSandboxRepository = ({ sandbox }) => {
  git(sandbox, ['init', '--quiet']);
  git(sandbox, ['add', '-A']);
  git(sandbox, [
    '-c',
    'user.name=Skill Benchmark',
    '-c',
    'user.email=skill-benchmark@localhost',
    'commit',
    '--quiet',
    '-m',
    'chore: initialize isolated benchmark sandbox',
  ]);
  return gitText(sandbox, ['rev-parse', 'HEAD']);
};

const gitVisibleFiles = (sandbox) =>
  git(sandbox, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
    .stdout.split('\0')
    .filter(Boolean)
    .sort();

const isInsidePath = (candidate, parent) =>
  candidate === parent || candidate.startsWith(`${parent}/`);

export const gitVisibleTreeHash = ({ sandbox, excludedPaths = [] }) => {
  const hash = crypto.createHash('sha256');
  for (const relativePath of gitVisibleFiles(sandbox)) {
    if (excludedPaths.some((excludedPath) => isInsidePath(relativePath, excludedPath))) {
      continue;
    }

    const absolutePath = path.join(sandbox, relativePath);
    const stat = fs.lstatSync(absolutePath);
    hash.update(relativePath);
    hash.update('\0');
    hash.update(`mode:${stat.mode & 0o777}`);
    hash.update('\0');
    hash.update(
      stat.isSymbolicLink()
        ? `symlink:${fs.readlinkSync(absolutePath)}`
        : fs.readFileSync(absolutePath),
    );
    hash.update('\0');
  }
  return hash.digest('hex');
};

const comparableInitialTreeHash = ({ sandbox, skillRelativePath }) =>
  gitVisibleTreeHash({
    sandbox,
    excludedPaths: ['.isolated-checkout', skillRelativePath.replaceAll(path.sep, '/')],
  });

export const ignoredUntrackedPaths = (sandbox) =>
  git(sandbox, ['ls-files', '--others', '--ignored', '--exclude-standard', '-z'])
    .stdout.split('\0')
    .filter(Boolean)
    .sort();

export const prepareSandbox = async ({
  configuration,
  evaluation,
  evalsRepoRelativePath,
  iterationDirectory,
  materials,
  runId,
  sandboxRoot,
  setupCommand,
  skillRelativePath,
}) => {
  const evalDirectory = path.join(iterationDirectory, evaluation.directory);
  const runDirectory = path.join(evalDirectory, configuration);
  const outputsDirectory = path.join(runDirectory, 'outputs');
  const sandboxId = `${evaluation.directory}-${configuration}`;
  const sandbox = path.join(sandboxRoot, sandboxId);

  fs.mkdirSync(outputsDirectory, { recursive: true });
  fs.mkdirSync(sandbox, { recursive: true });
  runSync('tar', ['-xf', materials.sourceArchive, '-C', sandbox]);
  const markerPath = path.join(sandbox, '.isolated-checkout');
  try {
    fs.lstatSync(markerPath);
    throw new Error(`${sandboxId}: source가 reserved marker path를 사용합니다.`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  fs.writeFileSync(
    markerPath,
    `${JSON.stringify({ owner: 'repo-skill-benchmark', run_id: runId, sandbox_id: sandboxId })}\n`,
  );

  copyDirectory(materials.snapshots[configuration], path.join(sandbox, skillRelativePath));
  fs.rmSync(path.join(sandbox, evalsRepoRelativePath), { recursive: true, force: true });

  if (skillRelativePath !== benchmarkSkillRelativePath) {
    fs.rmSync(path.join(sandbox, benchmarkSkillRelativePath), {
      recursive: true,
      force: true,
    });
  }

  const inputPaths = copyInputFiles({ evaluation, sandbox });
  const initialCommit = initializeSandboxRepository({ sandbox });

  if (evaluation.fixturePatch) {
    git(sandbox, ['apply', evaluation.fixturePatch]);
  }

  if (setupCommand) {
    const setupResult = await runLoggedProcess({
      command: '/bin/sh',
      args: ['-c', setupCommand],
      cwd: sandbox,
      stdoutPath: path.join(runDirectory, 'setup.stdout.log'),
      stderrPath: path.join(runDirectory, 'setup.stderr.log'),
    });
    if (setupResult.exitCode !== 0) {
      throw new Error(
        `${evaluation.directory}/${configuration} setup 실패 (${setupResult.exitCode})`,
      );
    }
  }

  const effectiveSkillSha256 = hashDirectory(path.join(sandbox, skillRelativePath));
  if (effectiveSkillSha256 !== materials.snapshotHashes[configuration]) {
    throw new Error(
      `${evaluation.directory}/${configuration} setup 또는 fixture가 effective skill을 변경했습니다.`,
    );
  }

  const preservationBefore = evaluation.preservePaths.map((preservePath) =>
    hashPath(sandbox, preservePath),
  );
  const missingPreservePaths = preservationBefore
    .filter((entry) => !entry.exists && !evaluation.fixtureTouchedPaths.includes(entry.path))
    .map((entry) => entry.path);
  if (missingPreservePaths.length > 0) {
    throw new Error(
      `${evaluation.directory}/${configuration} preserve path가 없습니다: ${missingPreservePaths.join(', ')}`,
    );
  }

  const initialIgnoredPaths = ignoredUntrackedPaths(sandbox);
  fs.writeFileSync(
    path.join(runDirectory, 'initial-ignored-untracked.txt'),
    initialIgnoredPaths.length > 0 ? `${initialIgnoredPaths.join('\n')}\n` : '',
  );
  fs.writeFileSync(
    path.join(runDirectory, 'initial-status.txt'),
    gitStatus(sandbox),
  );
  fs.writeFileSync(
    path.join(runDirectory, 'initial.patch'),
    diffFromCommit(sandbox, initialCommit),
  );
  fs.writeFileSync(path.join(runDirectory, 'sandbox-path.txt'), `${sandbox}\n`);

  const blind = {
    target_evals_absent: !fs.existsSync(path.join(sandbox, skillRelativePath, 'evals')),
    eval_spec_absent: !fs.existsSync(path.join(sandbox, evalsRepoRelativePath)),
    evaluator_absent_or_target:
      skillRelativePath === benchmarkSkillRelativePath ||
      !fs.existsSync(path.join(sandbox, benchmarkSkillRelativePath)),
    original_git_history_absent: !fs.existsSync(
      path.join(sandbox, '.git', 'objects', 'info', 'alternates'),
    ),
    single_sanitized_history_commit: gitText(sandbox, ['rev-list', '--count', '--all']) === '1',
  };

  if (Object.values(blind).some((value) => !value)) {
    throw new Error(`${sandboxId} blind sandbox 검증에 실패했습니다.`);
  }

  return {
    configuration,
    evalDirectory,
    evaluation,
    effectiveSkillSha256,
    inputPaths,
    initialCommit,
    initialComparableTreeHash: comparableInitialTreeHash({ sandbox, skillRelativePath }),
    initialFullTreeHash: gitVisibleTreeHash({ sandbox }),
    initialIgnoredPaths,
    outputsDirectory,
    preservationBefore,
    runDirectory,
    sandbox,
    sandboxId,
    blind,
  };
};

export const finishPreservationCheck = (preparedRun) => {
  const after = preparedRun.evaluation.preservePaths.map((preservePath) =>
    hashPath(preparedRun.sandbox, preservePath),
  );
  const beforeByPath = new Map(preparedRun.preservationBefore.map((entry) => [entry.path, entry]));
  const results = after.map((entry) => {
    const before = beforeByPath.get(entry.path);
    return {
      path: entry.path,
      before,
      after: entry,
      preserved: before?.exists === entry.exists && before?.sha256 === entry.sha256,
    };
  });

  fs.writeFileSync(
    path.join(preparedRun.outputsDirectory, 'preservation.json'),
    `${JSON.stringify({ paths: results }, null, 2)}\n`,
  );
  return results;
};