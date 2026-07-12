import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { runLoggedProcess, runSync } from './command.mjs';
import { diffFromCommit, git, gitStatus, gitText } from './git.mjs';
import { finishPreservationCheck, ignoredUntrackedPaths } from './sandbox.mjs';

const ignoredArchiveByteLimit = 50 * 1024 * 1024;

const buildExecutorPrompt = ({ evaluation, inputPaths, skillRelativePath }) => {
  const inputs =
    inputPaths.length > 0 ? inputPaths.map((inputPath) => `- ${inputPath}`).join('\n') : '- 없음';

  return `현재 checkout 안에서 아래 사용자 작업을 실제로 끝까지 수행하세요.

- 현재 checkout의 AGENTS.md와 ${skillRelativePath}/SKILL.md를 먼저 읽고 적용하세요.
- checkout 밖의 파일은 읽거나 수정하지 마세요.
- 기존 dirty 변경과 요청 범위 밖 파일을 보존하고 커밋하지 마세요.
- 변경 범위에 맞는 검증을 실제로 실행하세요.
- 최종 답변에는 변경 결과, 실행한 검증, 실행하지 못한 행동 검증과 남은 위험을 구분하세요.

## 입력 파일

${inputs}

## 사용자 작업

${evaluation.prompt}
`;
};

const parseCodexTranscript = (transcriptPath) => {
  const lines = fs.existsSync(transcriptPath)
    ? fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean)
    : [];

  const markdown = [];
  const commands = [];
  const toolCalls = {};
  let inputTokens = 0;
  let cachedInputTokens = 0;
  let outputTokens = 0;
  let errors = 0;

  for (const line of lines) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }

    if (event.type === 'turn.completed' && event.usage) {
      inputTokens += event.usage.input_tokens ?? 0;
      cachedInputTokens += event.usage.cached_input_tokens ?? 0;
      outputTokens += event.usage.output_tokens ?? 0;
    }

    if (event.type !== 'item.completed' || !event.item) {
      continue;
    }

    const item = event.item;
    toolCalls[item.type] = (toolCalls[item.type] ?? 0) + 1;

    if (item.type === 'agent_message') {
      markdown.push(item.text ?? '');
    }

    if (item.type === 'command_execution') {
      const exitCode = item.exit_code ?? 'unknown';
      commands.push(`$ ${item.command ?? '<unknown command>'}\nexit_code=${exitCode}\n`);
      markdown.push(
        `## Command\n\n\`\`\`sh\n${item.command ?? ''}\n\`\`\`\n\nexit_code=${exitCode}\n\n\`\`\`text\n${item.aggregated_output ?? ''}\n\`\`\``
      );
      if (typeof exitCode === 'number' && exitCode !== 0) {
        errors += 1;
      }
    }
  }

  return {
    cachedInputTokens,
    commands,
    errors,
    inputTokens,
    markdown,
    outputTokens,
    toolCalls,
  };
};

const parseTranscript = (transcriptPath, format) => {
  if (format === 'codex-jsonl') {
    return parseCodexTranscript(transcriptPath);
  }

  const content = fs.existsSync(transcriptPath) ? fs.readFileSync(transcriptPath, 'utf8') : '';
  return {
    cachedInputTokens: null,
    commands: [],
    errors: 0,
    inputTokens: null,
    markdown: [content],
    outputTokens: null,
    toolCalls: {},
  };
};

const outputByteCount = (outputsDirectory) =>
  fs
    .readdirSync(outputsDirectory)
    .map((fileName) => {
      const filePath = path.join(outputsDirectory, fileName);
      return fs.statSync(filePath).isFile() ? fs.statSync(filePath).size : 0;
    })
    .reduce((sum, count) => sum + count, 0);

const archiveNewIgnoredFiles = ({ after, before, destination, sandbox }) => {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  const added = after.filter((relativePath) => !beforeSet.has(relativePath));
  const removed = before.filter((relativePath) => !afterSet.has(relativePath));
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-skill-benchmark-ignored-'));
  const archived = [];
  const omitted = [];
  let archivedBytes = 0;

  try {
    for (const relativePath of added) {
      const source = path.resolve(sandbox, relativePath);
      const relative = path.relative(sandbox, source);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        omitted.push({ path: relativePath, reason: 'sandbox-boundary' });
        continue;
      }

      const stat = fs.lstatSync(source);
      if (!stat.isFile() && !stat.isSymbolicLink()) {
        omitted.push({ path: relativePath, reason: 'unsupported-file-type' });
        continue;
      }

      if (!stat.isSymbolicLink() && archivedBytes + stat.size > ignoredArchiveByteLimit) {
        omitted.push({ path: relativePath, reason: 'archive-byte-limit', bytes: stat.size });
        continue;
      }

      const target = path.join(staging, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.cpSync(source, target, { dereference: false });
      archived.push(relativePath);
      archivedBytes += stat.isSymbolicLink() ? 0 : stat.size;
    }
    runSync('tar', ['-czf', destination, '-C', staging, '.']);
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }

  return {
    added,
    removed,
    archived,
    omitted,
    archived_bytes: archivedBytes,
    byte_limit: ignoredArchiveByteLimit,
  };
};

export const runExecutor = async ({
  baselineSha,
  executor,
  materials,
  preparedRun,
  skillRelativePath,
  sourceSha,
}) => {
  const { evaluation, outputsDirectory, runDirectory, sandbox } = preparedRun;

  const executorPrompt = buildExecutorPrompt({
    evaluation,
    inputPaths: preparedRun.inputPaths,
    skillRelativePath,
  });
  const promptPath = path.join(runDirectory, 'executor-prompt.md');
  const transcriptPath = path.join(runDirectory, 'transcript.log');
  const reportPath = path.join(outputsDirectory, 'report.md');
  fs.writeFileSync(promptPath, executorPrompt);

  const invocation = executor.buildInvocation({
    promptPath,
    reportPath,
    sandbox,
  });

  const processResult = await runLoggedProcess({
    command: invocation.command,
    args: invocation.args,
    cwd: sandbox,
    env: invocation.env,
    input: executorPrompt,
    stdoutPath: transcriptPath,
    stderrPath: path.join(runDirectory, 'executor.stderr.log'),
  });

  if (executor.reportMode === 'stdout') {
    fs.copyFileSync(transcriptPath, reportPath);
  }
  const reportProduced =
    fs.existsSync(reportPath) &&
    fs.lstatSync(reportPath).isFile() &&
    !fs.lstatSync(reportPath).isSymbolicLink() &&
    fs.readFileSync(reportPath, 'utf8').trim().length > 0;
  if (!reportProduced) {
    fs.writeFileSync(
      reportPath,
      `Executor가 최종 report를 생성하지 못했습니다. exit=${processResult.exitCode}\n`,
    );
  }

  fs.writeFileSync(path.join(outputsDirectory, 'status.txt'), gitStatus(sandbox));
  fs.writeFileSync(
    path.join(outputsDirectory, 'changes.patch'),
    diffFromCommit(sandbox, preparedRun.initialCommit),
  );
  fs.writeFileSync(
    path.join(outputsDirectory, 'commits.txt'),
    git(sandbox, ['log', '--format=fuller', '--stat', `${preparedRun.initialCommit}..HEAD`]).stdout,
  );

  const finalIgnoredPaths = ignoredUntrackedPaths(sandbox);
  fs.writeFileSync(
    path.join(outputsDirectory, 'ignored-untracked-after.txt'),
    finalIgnoredPaths.length > 0 ? `${finalIgnoredPaths.join('\n')}\n` : '',
  );
  const ignoredAudit = archiveNewIgnoredFiles({
    after: finalIgnoredPaths,
    before: preparedRun.initialIgnoredPaths,
    destination: path.join(outputsDirectory, 'ignored-untracked-added.tar.gz'),
    sandbox,
  });
  fs.writeFileSync(
    path.join(outputsDirectory, 'ignored-untracked-audit.json'),
    `${JSON.stringify(ignoredAudit, null, 2)}\n`,
  );

  const parsed = parseTranscript(transcriptPath, executor.transcriptFormat);
  parsed.commands.push(
    `executor=${executor.name}\ncommand=${JSON.stringify([invocation.command, ...invocation.args])}\nexit=${processResult.exitCode}\n`,
  );
  fs.writeFileSync(path.join(runDirectory, 'transcript.md'), `${parsed.markdown.join('\n\n')}\n`);
  fs.writeFileSync(path.join(outputsDirectory, 'commands.txt'), `${parsed.commands.join('\n')}\n`);

  const preservation = finishPreservationCheck(preparedRun);
  const timing = {
    started_at: new Date(processResult.startedAtMs).toISOString(),
    ended_at: new Date(processResult.endedAtMs).toISOString(),
    duration_ms: processResult.durationMs,
    total_duration_seconds: processResult.durationMs / 1000,
    input_tokens: parsed.inputTokens,
    cached_input_tokens: parsed.cachedInputTokens,
    output_tokens: parsed.outputTokens,
    total_tokens:
      parsed.inputTokens === null || parsed.outputTokens === null
        ? null
        : parsed.inputTokens + parsed.outputTokens,
  };
  fs.writeFileSync(path.join(runDirectory, 'timing.json'), `${JSON.stringify(timing, null, 2)}\n`);

  const metrics = {
    tool_calls: parsed.toolCalls,
    total_tool_calls: Object.values(parsed.toolCalls).reduce((sum, count) => sum + count, 0),
    errors_encountered: parsed.errors + (processResult.exitCode === 0 ? 0 : 1),
    output_bytes: outputByteCount(outputsDirectory),
    transcript_chars: fs.readFileSync(path.join(runDirectory, 'transcript.md'), 'utf8').length,
  };
  fs.writeFileSync(
    path.join(outputsDirectory, 'metrics.json'),
    `${JSON.stringify(metrics, null, 2)}\n`,
  );

  const run = {
    eval_id: evaluation.id,
    eval_name: evaluation.name,
    configuration: preparedRun.configuration,
    source_commit: sourceSha,
    baseline_commit: baselineSha,
    sandbox,
    initial_commit: preparedRun.initialCommit,
    final_head: gitText(sandbox, ['rev-parse', 'HEAD']),
    initial_comparable_tree_sha256: preparedRun.initialComparableTreeSha256,
    skill_snapshot_sha256: materials.snapshotHashes[preparedRun.configuration],
    effective_skill_sha256: preparedRun.effectiveSkillSha256,
    blind: preparedRun.blind,
    parallel_safe: evaluation.parallelSafe,
    executor_adapter: executor.name,
    executor_adapter_sha256: executor.sha256,
    executor_exit_code: processResult.exitCode,
    executor_signal: processResult.signal,
    report_produced: reportProduced,
    preservation_ok: preservation.every((entry) => entry.preserved),
  };
  fs.writeFileSync(path.join(runDirectory, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);

  return { processResult, run, timing };
};