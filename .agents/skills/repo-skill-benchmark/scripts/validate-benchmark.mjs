#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { assertKnownOptions, parseArgs, requireOption } from './lib/args.mjs';
import { runSync } from './lib/command.mjs';
import { validateGradingData } from './lib/grading.mjs';
import { hashDirectory, hashFile } from './lib/sandbox.mjs';

const requiredRunFiles = [
  'executor-prompt.md',
  'initial-ignored-untracked.txt',
  'initial.patch',
  'initial-status.txt',
  'run.json',
  'sandbox-path.txt',
  'timing.json',
  'transcript.log',
  'transcript.md',
  'outputs/changes.patch',
  'outputs/commands.txt',
  'outputs/commits.txt',
  'outputs/ignored-untracked-added.tar.gz',
  'outputs/ignored-untracked-after.txt',
  'outputs/ignored-untracked-audit.json',
  'outputs/metrics.json',
  'outputs/preservation.json',
  'outputs/report.md',
  'outputs/status.txt',
];

const writeValidation = (iterationDirectory, errors, warnings, pairChecks, gradingRequired) => {
  const validation = {
    valid: errors.length === 0,
    grading_required: gradingRequired,
    validated_at: new Date().toISOString(),
    errors,
    warnings,
    pair_checks: pairChecks,
  };
  fs.writeFileSync(
    path.join(iterationDirectory, 'validation.json'),
    `${JSON.stringify(validation, null, 2)}\n`,
  );
  return validation;
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  assertKnownOptions(options, ['iteration', 'require-grading']);
  const iterationDirectory = path.resolve(requireOption(options, 'iteration'));
  const errors = [];
  const warnings = [];
  const pairChecks = [];

  const readJson = (filePath, label) => {
    if (!fs.existsSync(filePath)) {
      errors.push(`${label}: 파일 누락 (${filePath})`);
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      errors.push(`${label}: JSON 파싱 실패 (${error.message})`);
      return null;
    }
  };

  const checkAuditFile = (baseDirectory, entry, label) => {
    if (!entry || typeof entry.artifact !== 'string' || typeof entry.sha256 !== 'string') {
      errors.push(`${label}: audit metadata가 올바르지 않습니다.`);
      return;
    }
    const artifact = path.resolve(baseDirectory, entry.artifact);
    const relative = path.relative(baseDirectory, artifact);
    if (relative.startsWith('../') || path.isAbsolute(relative) || !fs.existsSync(artifact)) {
      errors.push(`${label}: audit artifact 경로 또는 파일이 올바르지 않습니다.`);
      return;
    }
    if (!fs.lstatSync(artifact).isFile() && !fs.lstatSync(artifact).isSymbolicLink()) {
      errors.push(`${label}: audit artifact는 symlink가 아닌 regular file이어야 합니다.`);
      return;
    }
    if (hashFile(artifact) !== entry.sha256) {
      errors.push(`${label}: audit artifact hash가 다릅니다.`);
    }
  };

  const hashSnapshotArchive = (archivePath, label) => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'repo-skill-benchmark-validate-snapshot-'),
    );
    try {
      const entries = runSync('tar', ['-tzf', archivePath]).stdout.split('\n').filter(Boolean);
      if (
        entries.some((entry) => {
          const normalized = path.posix.normalize(entry.replace(/^\.\//, ''));
          return path.posix.isAbsolute(normalized) || normalized.startsWith('../');
        })
      ) {
        errors.push(`${label}: snapshot archive path가 경계를 벗어납니다.`);
        return null;
      }
      runSync('tar', ['-xzf', archivePath, '-C', temporaryDirectory]);
      return hashDirectory(temporaryDirectory);
    } catch (error) {
      errors.push(`${label}: snapshot archive 해석 실패 (${error.message})`);
      return null;
    } finally {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  };

  const manifest = readJson(path.join(iterationDirectory, 'manifest.json'), 'manifest');
  if (!manifest) {
    const validation = writeValidation(
      iterationDirectory,
      errors,
      warnings,
      pairChecks,
      options['require-grading'] === true,
    );
    console.error(`benchmark 검증 실패: errors=${errors.length}`);
    process.exitCode = validation.valid ? 0 : 1;
    return;
  }

  const rootPreservation = readJson(
    path.join(iterationDirectory, 'root-preservation.json'),
    'root preservation',
  );
  if (rootPreservation && !rootPreservation.preserved) {
    errors.push('live repository 상태가 benchmark 전후에 달라졌습니다.');
  }
  if (manifest.status !== 'completed') {
    errors.push(`benchmark status가 completed가 아닙니다: ${manifest.status}`);
  }
  if (manifest.executor_failures !== 0) {
    errors.push(`executor_failures가 0이 아닙니다: ${manifest.executor_failures}`);
  }
  if (manifest.runs_per_configuration !== 1) {
    errors.push('runs_per_configuration은 1이어야 합니다.');
  }
  const adapterArtifact = path.resolve(
    iterationDirectory,
    manifest.executor_adapter_artifact ?? '',
  );
  const adapterRelative = path.relative(iterationDirectory, adapterArtifact);
  if (
    !manifest.executor_adapter_artifact ||
    adapterRelative.startsWith('../') ||
    path.isAbsolute(adapterRelative) ||
    !fs.existsSync(adapterArtifact) ||
    !fs.lstatSync(adapterArtifact).isFile() ||
    fs.lstatSync(adapterArtifact).isSymbolicLink() ||
    hashFile(adapterArtifact) !== manifest.executor_adapter_sha256
  ) {
    errors.push('executor adapter 검사 artifact 또는 hash가 올바르지 않습니다.');
  }
  if (
    !Array.isArray(manifest.configurations) ||
    manifest.configurations.join(',') !== 'with_skill,old_skill'
  ) {
    errors.push('configuration은 with_skill, old_skill이어야 합니다.');
  }
  if (!manifest.snapshot_sha256 || !manifest.snapshot_archives) {
    errors.push('snapshot hash 또는 검사 archive가 없습니다.');
  } else {
    for (const configuration of ['with_skill', 'old_skill']) {
      const entry = manifest.snapshot_archives[configuration];
      if (!entry || typeof entry.artifact !== 'string') {
        errors.push(`${configuration}: snapshot archive metadata 누락`);
        continue;
      }
      const archivePath = path.resolve(iterationDirectory, entry.artifact);
      const relative = path.relative(iterationDirectory, archivePath);
      if (relative.startsWith('../') || path.isAbsolute(relative) || !fs.existsSync(archivePath)) {
        errors.push(`${configuration}: snapshot archive 누락 또는 경계 위반`);
        continue;
      }
      if (hashFile(archivePath) !== entry.archive_sha256) {
        errors.push(`${configuration}: snapshot archive hash 불일치`);
      }
      if (entry.tree_sha256 !== manifest.snapshot_sha256[configuration]) {
        errors.push(`${configuration}: snapshot tree hash 불일치`);
      }
      const archiveTreeHash = hashSnapshotArchive(archivePath, configuration);
      if (archiveTreeHash && archiveTreeHash !== entry.tree_sha256) {
        errors.push(`${configuration}: snapshot archive 내용과 tree hash가 다릅니다.`);
      }
    }
    if (manifest.snapshot_sha256.with_skill === manifest.snapshot_sha256.old_skill) {
      warnings.push('old와 current skill snapshot hash가 같습니다.');
    }
  }

  if (!Array.isArray(manifest.evaluations) || manifest.evaluations.length === 0) {
    errors.push('manifest evaluations가 비어 있습니다.');
  }
  const configurations = Array.isArray(manifest.configurations) ? manifest.configurations : [];

  for (const evaluation of manifest.evaluations ?? []) {
    const evalDirectory = path.join(iterationDirectory, evaluation.directory);
    const metadata = readJson(
      path.join(evalDirectory, 'eval_metadata.json'),
      `${evaluation.directory} metadata`,
    );
    if (!metadata) {
      continue;
    }
    const auditInputs = metadata.audit?.inputs;
    if (!Array.isArray(auditInputs)) {
      errors.push(`${evaluation.directory}: input audit 배열이 없습니다.`);
    }
    for (const [index, input] of (Array.isArray(auditInputs) ? auditInputs : []).entries()) {
      checkAuditFile(evalDirectory, input, `${evaluation.directory} input ${index}`);
    }
    if (metadata.fixture_patch) {
      checkAuditFile(evalDirectory, metadata.audit?.fixture, `${evaluation.directory} fixture`);
      const touched = metadata.fixture_touched_paths ?? [];
      const preserve = new Set(metadata.preserve_paths ?? []);
      if (touched.some((touchedPath) => !preserve.has(touchedPath))) {
        errors.push(`${evaluation.directory}: fixture preserve coverage 누락`);
      }
    }

    const runs = {};
    for (const configuration of configurations) {
      const runDirectory = path.join(evalDirectory, configuration);
      let requiredFilesPresent = true;
      for (const relativePath of requiredRunFiles) {
        if (!fs.existsSync(path.join(runDirectory, relativePath))) {
          errors.push(`${evaluation.directory}/${configuration}: ${relativePath} 누락`);
          requiredFilesPresent = false;
        }
      }
      if (!requiredFilesPresent) {
        continue;
      }

      const run = readJson(
        path.join(runDirectory, 'run.json'),
        `${evaluation.directory}/${configuration} run`,
      );
      const timing = readJson(
        path.join(runDirectory, 'timing.json'),
        `${evaluation.directory}/${configuration} timing`,
      );
      if (!run || !timing) {
        continue;
      }
      runs[configuration] = { run, timing };

      if (run.source_commit !== manifest.source_commit) {
        errors.push(`${evaluation.directory}/${configuration}: source commit 불일치`);
      }
      if (run.configuration !== configuration || run.eval_id !== evaluation.id) {
        errors.push(`${evaluation.directory}/${configuration}: run identity 불일치`);
      }
      if (run.parallel_safe !== evaluation.parallel_safe) {
        errors.push(`${evaluation.directory}/${configuration}: parallel_safe 불일치`);
      }
      if (run.skill_snapshot_sha256 !== manifest.snapshot_sha256?.[configuration]) {
        errors.push(`${evaluation.directory}/${configuration}: skill snapshot hash 불일치`);
      }
      if (run.effective_skill_sha256 !== run.skill_snapshot_sha256) {
        errors.push(`${evaluation.directory}/${configuration}: effective skill hash 불일치`);
      }
      if (
        run.executor_adapter !== manifest.executor_adapter ||
        run.executor_adapter_sha256 !== manifest.executor_adapter_sha256
      ) {
        errors.push(`${evaluation.directory}/${configuration}: executor adapter 불일치`);
      }
      if (run.initial_comparable_tree_sha256 !== evaluation.initial_comparable_tree_sha256) {
        errors.push(`${evaluation.directory}/${configuration}: 초기 tree hash 불일치`);
      }
      if (run.executor_exit_code !== 0) {
        errors.push(
          `${evaluation.directory}/${configuration}: executor exit ${run.executor_exit_code}`,
        );
      }
      if (!run.report_produced) {
        errors.push(`${evaluation.directory}/${configuration}: executor report 누락`);
      }
      const reportPath = path.join(runDirectory, 'outputs', 'report.md');
      if (
        !fs.lstatSync(reportPath).isFile() ||
        fs.lstatSync(reportPath).isSymbolicLink() ||
        fs.readFileSync(reportPath, 'utf8').trim().length === 0
      ) {
        errors.push(`${evaluation.directory}/${configuration}: executor report가 비어 있습니다.`);
      }
      if (!run.blind || Object.values(run.blind).some((value) => value !== true)) {
        errors.push(`${evaluation.directory}/${configuration}: blind 검증 실패`);
      }
      if (!run.preservation_ok) {
        errors.push(`${evaluation.directory}/${configuration}: preserve path 변경`);
      }
      if (
        !Number.isFinite(timing.duration_ms) ||
        !Number.isFinite(timing.total_duration_seconds) ||
        (timing.total_tokens !== null && !Number.isFinite(timing.total_tokens)) ||
        (timing.output_tokens !== null && !Number.isFinite(timing.output_tokens))
      ) {
        errors.push(`${evaluation.directory}/${configuration}: timing 수치가 올바르지 않습니다.`);
      }

      if (!evaluation.parallel_safe) {
        const reset = readJson(
          path.join(runDirectory, 'serial-reset.json'),
          `${evaluation.directory}/${configuration} serial reset`,
        );
        if (reset) {
          if (Boolean(reset.configured) !== Boolean(evaluation.serial_reset_configured)) {
            errors.push(`${evaluation.directory}/${configuration}: serial reset 설정 불일치`);
          }
          if (
            reset.configured &&
            (!reset.executed || reset.exit_code !== 0 || !reset.checkout_preserved)
          ) {
            errors.push(`${evaluation.directory}/${configuration}: serial reset 실행 실패`);
          }
        }
      }

      const gradingPath = path.join(runDirectory, 'grading.json');
      if (fs.existsSync(gradingPath)) {
        const grading = readJson(gradingPath, `${evaluation.directory}/${configuration} grading`);
        if (grading) {
          errors.push(
            ...validateGradingData({
              grading,
              expectedTexts: metadata.expectations,
              label: gradingPath,
            }).errors,
          );
        }
      } else if (options['require-grading']) {
        errors.push(`${evaluation.directory}/${configuration}: grading.json 누락`);
      }
    }

    if (!runs.with_skill || !runs.old_skill) {
      continue;
    }
    if (runs.with_skill.run.sandbox === runs.old_skill.run.sandbox) {
      errors.push(`${evaluation.directory}: old와 current sandbox가 같습니다.`);
    }
    if (
      runs.with_skill.run.initial_comparable_tree_sha256 !==
      runs.old_skill.run.initial_comparable_tree_sha256
    ) {
      errors.push(`${evaluation.directory}: old/current 초기 project tree가 다릅니다.`);
    }

    const withStart = Date.parse(runs.with_skill.timing.started_at);
    const withEnd = Date.parse(runs.with_skill.timing.ended_at);
    const oldStart = Date.parse(runs.old_skill.timing.started_at);
    const oldEnd = Date.parse(runs.old_skill.timing.ended_at);
    const timestamps = [withStart, withEnd, oldStart, oldEnd];
    if (
      timestamps.some((value) => !Number.isFinite(value)) ||
      withEnd < withStart ||
      oldEnd < oldStart
    ) {
      errors.push(`${evaluation.directory}: timing timestamp가 올바르지 않습니다.`);
      continue;
    }

    const overlapMs = Math.min(withEnd, oldEnd) - Math.max(withStart, oldStart);
    const startDeltaMs = Math.abs(withStart - oldStart);
    if (evaluation.parallel_safe && overlapMs <= 0) {
      errors.push(`${evaluation.directory}: parallel pair 실행 구간이 겹치지 않습니다.`);
    }
    if (!evaluation.parallel_safe && overlapMs > 0) {
      errors.push(`${evaluation.directory}: serial pair 실행 구간이 겹쳤습니다.`);
    }
    if (!evaluation.parallel_safe && Array.isArray(evaluation.serial_order)) {
      const firstConfiguration = withStart < oldStart ? 'with_skill' : 'old_skill';
      if (firstConfiguration !== evaluation.serial_order[0]) {
        errors.push(`${evaluation.directory}: 기록된 serial order와 timing이 다릅니다.`);
      }
    }
    pairChecks.push({
      eval_id: evaluation.id,
      parallel_safe: evaluation.parallel_safe,
      start_delta_ms: startDeltaMs,
      overlap_ms: overlapMs,
      overlapped: overlapMs > 0,
    });
  }

  const validation = writeValidation(
    iterationDirectory,
    errors,
    warnings,
    pairChecks,
    options['require-grading'] === true,
  );
  console.log(
    `benchmark 검증: ${validation.valid ? '성공' : '실패'}, errors=${errors.length}, warnings=${warnings.length}`,
  );
  for (const check of pairChecks) {
    console.log(
      `  eval ${check.eval_id}: start delta=${check.start_delta_ms}ms, overlap=${check.overlap_ms}ms`,
    );
  }
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  if (!validation.valid) {
    process.exitCode = 1;
  }
};

try {
  main();
} catch (error) {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
}