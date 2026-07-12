#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  assertKnownOptions,
  parseArgs,
  parsePositiveInteger,
  requireOption,
  toRepoRelativePath,
} from './lib/args.mjs';
import { runExecutor } from './lib/artifacts.mjs';
import {
  assertNotInterrupted,
  installSignalHandlers,
  runLoggedProcess,
  runSync,
} from './lib/command.mjs';
import { loadEvaluations } from './lib/evals.mjs';
import { loadExecutorAdapter } from './lib/executor-adapter.mjs';
import { gitStatus, gitText } from './lib/git.mjs';
import {
  gitVisibleTreeHash,
  hashBuffer,
  hashFile,
  ignoredUntrackedPaths,
  prepareControllerMaterials,
  prepareSandbox,
} from './lib/sandbox.mjs';

const usage = `repo-skill-benchmark

node scripts/run-benchmark.mjs --skill <repo-relative-skill-path> [options]

Options:
  --repo <path>              Git repository root (default: current repo)
  --evals <path>             Eval JSON (default: <skill>/evals/evals.json)
  --ids <1,2>                Selected eval IDs (default: all)
  --source-ref <ref>         Project source for both configs (default: HEAD)
  --baseline-ref <ref>       Old skill source (default: HEAD)
  --workspace <path>         Artifact workspace (default: OS temp directory)
  --iteration <name>         Iteration directory name (default: next iteration-N)
  --jobs <even-number>       Parallel executor count (default: 2)
  --setup-command <command>  Per-sandbox setup command
  --skip-setup               Skip dependency setup
  --adapter <path>           Executor adapter JSON (default: bundled Codex adapter)
  --executor-command <path>  Override adapter executable
  --model <model>            Adapter model override for both configs
  --unsafe-bypass-sandbox    Use adapter-declared unsafe args
`;

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const nextIterationName = (workspace) => {
  if (!fs.existsSync(workspace)) {
    return 'iteration-1';
  }

  const numbers = fs
    .readdirSync(workspace)
    .map((name) => name.match(/^iteration-(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number);
  return `iteration-${numbers.length === 0 ? 1 : Math.max(...numbers) + 1}`;
};

const defaultSetupCommand = (repoRoot, skipSetup, explicitCommand) => {
  if (skipSetup) {
    return null;
  }
  if (explicitCommand) {
    return explicitCommand;
  }
  if (fs.existsSync(path.join(repoRoot, 'pnpm-lock.yaml'))) {
    return 'CI=1 pnpm install --frozen-lockfile --offline';
  }
  return null;
};

const canonicalPotentialPath = (candidate) => {
  const suffix = [];
  let cursor = path.resolve(candidate);
  while (!fs.existsSync(cursor)) {
    const parent = path.dirname(cursor);
    if (parent === cursor) {
      return path.resolve(candidate);
    }
    suffix.unshift(path.basename(cursor));
    cursor = parent;
  }
  return path.join(fs.realpathSync(cursor), ...suffix);
};

const relativeIfInside = (parent, candidate) => {
  const relative = path.relative(parent, candidate);
  return relative === '' || relative.startsWith('../') || path.isAbsolute(relative)
    ? null
    : relative;
};

const assertWorkspaceSafe = ({ explicit, repoRoot, skillDirectory, workspace }) => {
  const canonicalRepo = canonicalPotentialPath(repoRoot);
  const canonicalSkill = canonicalPotentialPath(skillDirectory);
  const canonicalWorkspace = canonicalPotentialPath(workspace);
  if (
    canonicalWorkspace === canonicalSkill ||
    relativeIfInside(canonicalSkill, canonicalWorkspace)
  ) {
    throw new Error('--workspace는 target skill directory 밖에 있어야 합니다.');
  }

  if (canonicalWorkspace === canonicalRepo) {
    throw new Error('--workspace로 repository root를 사용할 수 없습니다.');
  }

  const repoRelative = relativeIfInside(canonicalRepo, canonicalWorkspace);
  if (!repoRelative) {
    return;
  }
  if (!explicit) {
    throw new Error('기본 workspace는 repository 밖에 있어야 합니다.');
  }

  const ignored = runSync('git', ['-C', repoRoot, 'check-ignore', '-q', '--', repoRelative], {
    allowFailure: true,
  });
  if (ignored.exitCode !== 0) {
    throw new Error(`repository 내부 --workspace는 gitignore 대상이어야 합니다: ${repoRelative}`);
  }
};

const copyEvaluationAudit = (evalDirectory, evaluation) => {
  const auditDirectory = path.join(evalDirectory, 'audit');
  const inputDirectory = path.join(auditDirectory, 'inputs');
  fs.mkdirSync(inputDirectory, { recursive: true });

  const frozenFiles = [];
  const inputs = evaluation.files.map((file, index) => {
    const fileName = `${index}-${path.basename(file.relative)}`;
    const destination = path.join(inputDirectory, fileName);
    fs.copyFileSync(file.source, destination);
    fs.chmodSync(destination, 0o444);
    frozenFiles.push({ source: destination, relative: file.relative });
    return {
      source: file.relative,
      artifact: path.relative(evalDirectory, destination),
      sha256: hashFile(destination),
    };
  });

  let fixture = null;
  let frozenFixturePatch = null;
  if (evaluation.fixturePatch) {
    const destination = path.join(auditDirectory, 'fixture.patch');
    fs.copyFileSync(evaluation.fixturePatch, destination);
    fs.chmodSync(destination, 0o444);
    frozenFixturePatch = destination;
    fixture = {
      source: evaluation.fixturePatchLabel,
      artifact: path.relative(evalDirectory, destination),
      sha256: hashFile(destination),
      touched_paths: evaluation.fixtureTouchedPaths,
    };
  }
  return {
    audit: { fixture, inputs },
    frozenFiles,
    frozenFixturePatch,
  };
};

const writeEvaluationMetadata = (iterationDirectory, evaluation) => {
  const evalDirectory = path.join(iterationDirectory, evaluation.directory);
  fs.mkdirSync(evalDirectory, { recursive: true });
  const { audit, frozenFiles, frozenFixturePatch } = copyEvaluationAudit(evalDirectory, evaluation);
  writeJson(path.join(evalDirectory, 'eval_metadata.json'), {
    eval_id: evaluation.id,
    eval_name: evaluation.name,
    prompt: evaluation.prompt,
    expected_output: evaluation.expectedOutput,
    expectations: evaluation.expectations,
    parallel_safe: evaluation.parallelSafe,
    fixture_patch: evaluation.fixturePatchLabel ?? null,
    fixture_touched_paths: evaluation.fixtureTouchedPaths,
    preserve_paths: evaluation.preservePaths,
    serial_reset_command: evaluation.serialResetCommand,
    audit,
  });
  return {
    ...evaluation,
    files: frozenFiles,
    fixturePatch: frozenFixturePatch,
  };
};

const recordRunError = (preparedRun, error) => {
  const value = {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : null,
  };
  writeJson(path.join(preparedRun.runDirectory, 'run-error.json'), value);
  return value.error;
};

const settleExecutor = async (context, preparedRun) => {
  try {
    const result = await runExecutor({ ...context, preparedRun });
    return {
      ok: true,
      configuration: preparedRun.configuration,
      evalId: preparedRun.evaluation.id,
      ...result,
    };
  } catch (error) {
    return {
      ok: false,
      configuration: preparedRun.configuration,
      evalId: preparedRun.evaluation.id,
      error: recordRunError(preparedRun, error),
    };
  }
};

const runSerialReset = async ({ evaluation, preparedRun }) => {
  const resetPath = path.join(preparedRun.runDirectory, 'serial-reset.json');
  if (!evaluation.serialResetCommand) {
    writeJson(resetPath, { configured: false, executed: false });
    return { ok: true };
  }

  const before = {
    head: gitText(preparedRun.sandbox, ['rev-parse', 'HEAD']),
    tree_sha256: gitVisibleTreeHash({ sandbox: preparedRun.sandbox }),
    ignored_paths: ignoredUntrackedPaths(preparedRun.sandbox),
  };
  if (
    before.head !== preparedRun.initialCommit ||
    before.tree_sha256 !== preparedRun.initialFullTreeSha256 ||
    JSON.stringify(before.ignored_paths) !== JSON.stringify(preparedRun.initialIgnoredPaths)
  ) {
    const error = 'serial reset 전 sandbox가 prepared initial state와 다릅니다.';
    writeJson(resetPath, { configured: true, executed: false, before, error });
    return { ok: false, error };
  }

  try {
    const result = await runLoggedProcess({
      command: '/bin/sh',
      args: ['-lc', evaluation.serialResetCommand],
      cwd: preparedRun.sandbox,
      stdoutPath: path.join(preparedRun.runDirectory, 'serial-reset.stdout.log'),
      stderrPath: path.join(preparedRun.runDirectory, 'serial-reset.stderr.log'),
    });
    const after = {
      head: gitText(preparedRun.sandbox, ['rev-parse', 'HEAD']),
      tree_sha256: gitVisibleTreeHash({ sandbox: preparedRun.sandbox }),
      ignored_paths: ignoredUntrackedPaths(preparedRun.sandbox),
    };
    const checkoutPreserved =
      before.head === after.head &&
      before.tree_sha256 === after.tree_sha256 &&
      JSON.stringify(before.ignored_paths) === JSON.stringify(after.ignored_paths);
    const value = {
      configured: true,
      executed: true,
      command: evaluation.serialResetCommand,
      exit_code: result.exitCode,
      duration_ms: result.durationMs,
      before,
      after,
      checkout_preserved: checkoutPreserved,
    };
    writeJson(resetPath, value);
    return {
      ok: result.exitCode === 0 && checkoutPreserved,
      error:
        result.exitCode !== 0
          ? `serial reset exit ${result.exitCode}`
          : 'serial reset이 sandbox checkout을 변경했습니다.',
    };
  } catch (error) {
    writeJson(resetPath, {
      configured: true,
      executed: true,
      command: evaluation.serialResetCommand,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
};

const executePair = async (context, preparedByConfiguration) => {
  const evaluation = preparedByConfiguration.with_skill.evaluation;
  const run = (configuration) => settleExecutor(context, preparedByConfiguration[configuration]);

  if (evaluation.parallelSafe) {
    const configurations = ['with_skill', 'old_skill'];
    const outcomes = await Promise.allSettled(
      configurations.map((configuration) => run(configuration)),
    );
    return outcomes.map((outcome, index) => {
      if (outcome.status === 'fulfilled') {
        return outcome.value;
      }
      const preparedRun = preparedByConfiguration[configurations[index]];
      return {
        ok: false,
        configuration: configurations[index],
        evalId: evaluation.id,
        error: recordRunError(preparedRun, outcome.reason),
      };
    });
  }

  const order = evaluation.id % 2 === 0 ? ['old_skill', 'with_skill'] : ['with_skill', 'old_skill'];
  const results = [];
  for (const configuration of order) {
    assertNotInterrupted();
    const preparedRun = preparedByConfiguration[configuration];
    const reset = await runSerialReset({ evaluation, preparedRun });
    if (!reset.ok) {
      results.push({
        ok: false,
        configuration,
        evalId: evaluation.id,
        error: recordRunError(preparedRun, new Error(reset.error)),
      });
      continue;
    }
    assertNotInterrupted();
    results.push(await run(configuration));
  }
  return results;
};

const executeInBatches = async ({ context, evaluations, jobs, preparedRuns }) => {
  const batchSize = jobs / 2;
  const safeQueue = [];
  const results = [];

  const flushSafeQueue = async () => {
    while (safeQueue.length > 0) {
      assertNotInterrupted();
      const batch = safeQueue.splice(0, batchSize);
      const pairOutcomes = await Promise.allSettled(
        batch.map((evaluation) => executePair(context, preparedRuns.get(evaluation.id))),
      );
      results.push(
        ...pairOutcomes
          .filter((outcome) => outcome.status === 'fulfilled')
          .flatMap((outcome) => outcome.value),
      );
      const rejected = pairOutcomes.find((outcome) => outcome.status === 'rejected');
      if (rejected) {
        throw rejected.reason;
      }
    }
  };

  for (const evaluation of evaluations) {
    assertNotInterrupted();
    if (evaluation.parallelSafe) {
      safeQueue.push(evaluation);
      if (safeQueue.length === batchSize) {
        await flushSafeQueue();
      }
      continue;
    }

    await flushSafeQueue();
    results.push(...(await executePair(context, preparedRuns.get(evaluation.id))));
  }

  await flushSafeQueue();
  return results;
};

const writeSnapshotAudit = (iterationDirectory, manifest, materials) => {
  const snapshotDirectory = path.join(iterationDirectory, 'audit', 'snapshots');
  fs.mkdirSync(snapshotDirectory, { recursive: true });
  manifest.snapshot_archives = {};
  for (const configuration of ['with_skill', 'old_skill']) {
    const destination = path.join(snapshotDirectory, `${configuration}.tar.gz`);
    const buffer = materials.snapshotArchives[configuration];
    fs.writeFileSync(destination, buffer);
    manifest.snapshot_archives[configuration] = {
      artifact: path.relative(iterationDirectory, destination),
      archive_sha256: hashBuffer(buffer),
      tree_sha256: materials.snapshotHashes[configuration],
    };
  }
  materials.snapshotArchives = {};
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  assertKnownOptions(options, [
    'help',
    'repo',
    'skill',
    'evals',
    'ids',
    'source-ref',
    'baseline-ref',
    'workspace',
    'iteration',
    'jobs',
    'setup-command',
    'skip-setup',
    'adapter',
    'executor-command',
    'model',
    'unsafe-bypass-sandbox',
  ]);
  if (options.help) {
    console.log(usage);
    return;
  }

  installSignalHandlers();

  const repoRoot = path.resolve(
    options.repo ?? runSync('git', ['rev-parse', '--show-toplevel']).stdout.trim(),
  );
  const skillDirectory = path.resolve(repoRoot, requireOption(options, 'skill'));
  const skillRelativePath = toRepoRelativePath(repoRoot, skillDirectory, 'target skill');
  const evalsPath = path.resolve(
    repoRoot,
    options.evals ?? path.join(skillRelativePath, 'evals', 'evals.json'),
  );
  const evalsRepoRelativePath = toRepoRelativePath(repoRoot, evalsPath, 'evals.json');
  const selectedIds = options.ids
    ? new Set(options.ids.split(',').map((id) => Number(id.trim())))
    : null;
  if (selectedIds && [...selectedIds].some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error(`--ids는 양의 정수 목록이어야 합니다: ${options.ids}`);
  }
  const { evaluations, skillName } = loadEvaluations({
    skillDirectory,
    evalsPath,
    selectedIds,
  });
  const jobs = parsePositiveInteger(options.jobs, 2, 'jobs');
  if (jobs < 2 || jobs % 2 !== 0) {
    throw new Error('--jobs는 2 이상의 짝수여야 합니다.');
  }

  const repoKey = crypto.createHash('sha256').update(repoRoot).digest('hex').slice(0, 12);
  const workspace = path.resolve(
    options.workspace ??
      path.join(os.tmpdir(), 'repo-skill-benchmark-artifacts', repoKey, skillName),
  );
  if (workspace === path.parse(workspace).root) {
    throw new Error('--workspace로 filesystem root를 사용할 수 없습니다.');
  }
  assertWorkspaceSafe({
    explicit: options.workspace !== undefined,
    repoRoot,
    skillDirectory,
    workspace,
  });

  const sourceRef = options['source-ref'] ?? 'HEAD';
  const baselineRef = options['baseline-ref'] ?? 'HEAD';
  const executor = loadExecutorAdapter({
    adapterPath: options.adapter ? path.resolve(repoRoot, options.adapter) : undefined,
    commandOverride: options['executor-command'],
    model: options.model,
    unsafe: options['unsafe-bypass-sandbox'] === true,
  });
  const setupCommand = defaultSetupCommand(
    repoRoot,
    options['skip-setup'],
    options['setup-command'],
  );

  const rootStatusBefore = gitStatus(repoRoot);
  const iterationName = options.iteration ?? nextIterationName(workspace);
  if (!/^[a-zA-Z0-9._-]+$/.test(iterationName) || iterationName === '.' || iterationName === '..') {
    throw new Error(`--iteration은 path separator를 포함할 수 없습니다: ${iterationName}`);
  }
  const iterationDirectory = path.join(workspace, iterationName);
  if (fs.existsSync(iterationDirectory)) {
    throw new Error(`iteration directory가 이미 존재합니다: ${iterationDirectory}`);
  }
  fs.mkdirSync(iterationDirectory, { recursive: true });
  fs.writeFileSync(path.join(iterationDirectory, 'root-status-before.txt'), rootStatusBefore);

  const runId = crypto.randomUUID();
  const sandboxRoot = path.join(
    os.tmpdir(),
    'repo-skill-benchmark',
    repoKey,
    skillName,
    `${iterationName}-${runId}`,
  );
  fs.mkdirSync(sandboxRoot, { recursive: true });
  writeJson(path.join(sandboxRoot, '.repo-skill-benchmark-run.json'), {
    owner: 'repo-skill-benchmark',
    run_id: runId,
  });

  const expectedSandboxes = evaluations.flatMap((evaluation) =>
    ['with_skill', 'old_skill'].map((configuration) =>
      path.join(sandboxRoot, `${evaluation.directory}-${configuration}`),
    ),
  );
  const manifest = {
    schema_version: 2,
    run_id: runId,
    status: 'preparing',
    skill_name: skillName,
    skill_path: skillRelativePath,
    evals_path: evalsRepoRelativePath,
    source_ref: sourceRef,
    source_commit: null,
    baseline_ref: baselineRef,
    baseline_commit: null,
    snapshot_sha256: null,
    configurations: ['with_skill', 'old_skill'],
    runs_per_configuration: 1,
    jobs,
    setup_command: setupCommand,
    sandbox_root: sandboxRoot,
    sandboxes: expectedSandboxes,
    evaluations: evaluations.map((evaluation) => ({
      id: evaluation.id,
      name: evaluation.name,
      directory: evaluation.directory,
      parallel_safe: evaluation.parallelSafe,
      serial_order: evaluation.parallelSafe
        ? null
        : evaluation.id % 2 === 0
          ? ['old_skill', 'with_skill']
          : ['with_skill', 'old_skill'],
      serial_reset_configured: Boolean(evaluation.serialResetCommand),
      initial_comparable_tree_sha256: null,
    })),
    started_at: new Date().toISOString(),
    controller_materials_removed_before_execution: false,
    executor_model: options.model ?? 'adapter default',
    executor_adapter: executor.name,
    executor_adapter_sha256: executor.sha256,
    executor_adapter_artifact: 'audit/executor-adapter.json',
    executor_command: executor.command,
    executor_version: null,
    executor_unsafe_mode: options['unsafe-bypass-sandbox'] === true,
    node_version: process.version,
    platform: `${process.platform}-${process.arch}`,
  };
  const manifestPath = path.join(iterationDirectory, 'manifest.json');
  writeJson(manifestPath, manifest);

  let materials = null;
  let fatalError = null;
  let results = [];
  let executionStartedAtMs = null;
  try {
    fs.mkdirSync(path.join(iterationDirectory, 'audit'), { recursive: true });
    fs.writeFileSync(
      path.join(iterationDirectory, manifest.executor_adapter_artifact),
      executor.source,
    );
    manifest.executor_version =
      executor.versionArgs.length > 0
        ? runSync(executor.command, executor.versionArgs).stdout.trim()
        : null;
    console.log(`snapshot 준비: ${skillName} (${sourceRef} vs ${baselineRef})`);
    materials = prepareControllerMaterials({
      repoRoot,
      skillRelativePath,
      sourceRef,
      baselineRef,
      sandboxRoot,
    });
    manifest.source_commit = materials.sourceSha;
    manifest.baseline_commit = materials.baselineSha;
    manifest.snapshot_sha256 = materials.snapshotHashes;
    writeJson(manifestPath, manifest);

    const preparedRuns = new Map();
    for (const evaluation of evaluations) {
      const frozenEvaluation = writeEvaluationMetadata(iterationDirectory, evaluation);
      const byConfiguration = {};
      for (const configuration of ['with_skill', 'old_skill']) {
        console.log(`sandbox 준비: ${evaluation.directory}/${configuration}`);
        byConfiguration[configuration] = await prepareSandbox({
          configuration,
          evaluation: frozenEvaluation,
          evalsRepoRelativePath,
          iterationDirectory,
          materials,
          runId,
          sandboxRoot,
          setupCommand,
          skillRelativePath,
        });
      }
      if (
        byConfiguration.with_skill.initialComparableTreeSha256 !==
        byConfiguration.old_skill.initialComparableTreeSha256
      ) {
        throw new Error(`${evaluation.directory}: old/current 초기 project tree가 다릅니다.`);
      }
      manifest.evaluations.find(
        (candidate) => candidate.id === evaluation.id,
      ).initial_comparable_tree_sha256 = byConfiguration.with_skill.initialComparableTreeSha256;
      preparedRuns.set(evaluation.id, byConfiguration);
    }

    fs.rmSync(materials.controllerDirectory, { recursive: true, force: true });
    manifest.controller_materials_removed_before_execution = true;
    manifest.status = 'executing';
    executionStartedAtMs = Date.now();
    manifest.execution_started_at = new Date(executionStartedAtMs).toISOString();
    writeJson(manifestPath, manifest);

    console.log(`executor 시작: ${evaluations.length * 2} runs, jobs=${jobs}`);
    results = await executeInBatches({
      context: {
        baselineSha: materials.baselineSha,
        executor,
        materials,
        skillRelativePath,
        sourceSha: materials.sourceSha,
      },
      evaluations,
      jobs,
      preparedRuns,
    });
    manifest.executor_failures = results.filter(
      (result) =>
        !result.ok || result.processResult.exitCode !== 0 || result.run.report_produced !== true,
    ).length;
    manifest.status = manifest.executor_failures === 0 ? 'completed' : 'completed_with_failures';
  } catch (error) {
    fatalError = error;
    manifest.status = 'failed';
    manifest.failure = error instanceof Error ? error.message : String(error);
  } finally {
    fs.rmSync(path.join(sandboxRoot, '_controller'), { recursive: true, force: true });
    if (materials?.snapshotArchives && !manifest.snapshot_archives) {
      writeSnapshotAudit(iterationDirectory, manifest, materials);
    }

    const endedAtMs = Date.now();
    manifest.ended_at = new Date(endedAtMs).toISOString();
    if (executionStartedAtMs !== null) {
      manifest.total_wall_seconds = (endedAtMs - executionStartedAtMs) / 1000;
    }

    const rootStatusAfter = gitStatus(repoRoot);
    fs.writeFileSync(path.join(iterationDirectory, 'root-status-after.txt'), rootStatusAfter);
    writeJson(path.join(iterationDirectory, 'root-preservation.json'), {
      preserved: rootStatusBefore === rootStatusAfter,
    });
    manifest.live_repository_preserved = rootStatusBefore === rootStatusAfter;
    writeJson(manifestPath, manifest);
  }

  console.log(`결과: ${iterationDirectory}`);
  if (fatalError) {
    throw fatalError;
  }

  if (manifest.executor_failures > 0 || !manifest.live_repository_preserved) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error.stack ?? error.message);
  if (!process.exitCode) {
    process.exitCode = 1;
  }
});