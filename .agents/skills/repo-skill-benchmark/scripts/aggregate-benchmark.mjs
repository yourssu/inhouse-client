#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { assertKnownOptions, parseArgs, requireOption } from './lib/args.mjs';
import { validateGradingData } from './lib/grading.mjs';

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const summarizeConfiguration = (runs) => {
  const passed = runs.reduce((sum, run) => sum + run.result.passed, 0);
  const total = runs.reduce((sum, run) => sum + run.result.total, 0);
  const durations = runs.map((run) => run.result.time_seconds);
  const outputTokens = runs.map((run) => run.result.output_tokens);
  const hasTokenTelemetry = outputTokens.every((value) => Number.isFinite(value));

  return {
    macro_pass_rate: mean(runs.map((run) => run.result.pass_rate)),
    weighted_pass_rate: total === 0 ? 0 : passed / total,
    passed,
    total,
    total_time_seconds: durations.reduce((sum, value) => sum + value, 0),
    median_time_seconds: median(durations),
    total_output_tokens: hasTokenTelemetry
      ? outputTokens.reduce((sum, value) => sum + value, 0)
      : null,
    median_output_tokens: hasTokenTelemetry ? median(outputTokens) : null,
  };
};

const formatTokens = (value) => (Number.isFinite(value) ? value.toLocaleString('en-US') : 'n/a');

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  assertKnownOptions(options, ['iteration']);
  const iterationDirectory = path.resolve(requireOption(options, 'iteration'));
  const manifestPath = path.join(iterationDirectory, 'manifest.json');
  const manifest = readJson(manifestPath);
  const validationPath = path.join(iterationDirectory, 'validation.json');
  if (!fs.existsSync(validationPath)) {
    throw new Error('validation.json이 없습니다. 먼저 --require-grading으로 검증하세요.');
  }
  const validation = readJson(validationPath);
  if (!validation.valid || !validation.grading_required) {
    throw new Error('grading을 포함해 성공한 validation만 집계할 수 있습니다.');
  }
  if (
    manifest.status !== 'completed' ||
    manifest.executor_failures !== 0 ||
    !manifest.live_repository_preserved
  ) {
    throw new Error('완료·보존된 benchmark만 집계할 수 있습니다.');
  }

  const runs = [];
  let withSkillWins = 0;
  let oldSkillWins = 0;
  let ties = 0;

  for (const evaluation of manifest.evaluations) {
    const evalDirectory = path.join(iterationDirectory, evaluation.directory);
    const metadata = readJson(path.join(evalDirectory, 'eval_metadata.json'));
    const comparison = {};

    for (const configuration of manifest.configurations) {
      const runDirectory = path.join(evalDirectory, configuration);
      const gradingPath = path.join(runDirectory, 'grading.json');
      if (!fs.existsSync(gradingPath)) {
        throw new Error(`${gradingPath}가 없습니다.`);
      }
      const grading = readJson(gradingPath);
      const timing = readJson(path.join(runDirectory, 'timing.json'));
      const gradingValidation = validateGradingData({
        grading,
        expectedTexts: metadata.expectations,
        label: gradingPath,
      });
      if (gradingValidation.errors.length > 0 || !gradingValidation.computed) {
        throw new Error(gradingValidation.errors.join('\n'));
      }
      if (
        !Number.isFinite(timing.total_duration_seconds) ||
        (timing.total_tokens !== null && !Number.isFinite(timing.total_tokens)) ||
        (timing.output_tokens !== null && !Number.isFinite(timing.output_tokens))
      ) {
        throw new Error(`${runDirectory}/timing.json의 수치가 올바르지 않습니다.`);
      }
      const computed = gradingValidation.computed;
      const result = {
        passed: computed.passed,
        failed: computed.failed,
        total: computed.total,
        pass_rate: computed.pass_rate,
        time_seconds: timing.total_duration_seconds,
        total_tokens: timing.total_tokens,
        output_tokens: timing.output_tokens,
      };
      comparison[configuration] = result;
      runs.push({
        eval_id: evaluation.id,
        eval_name: evaluation.name,
        configuration,
        result,
        expectations: grading.expectations,
        claims: grading.claims ?? [],
        eval_feedback: grading.eval_feedback ?? null,
      });
    }

    if (comparison.with_skill.pass_rate > comparison.old_skill.pass_rate) {
      withSkillWins += 1;
    } else if (comparison.with_skill.pass_rate < comparison.old_skill.pass_rate) {
      oldSkillWins += 1;
    } else {
      ties += 1;
    }
  }

  const withSkill = summarizeConfiguration(
    runs.filter((run) => run.configuration === 'with_skill'),
  );
  const oldSkill = summarizeConfiguration(runs.filter((run) => run.configuration === 'old_skill'));
  const benchmark = {
    metadata: {
      skill_name: manifest.skill_name,
      skill_path: manifest.skill_path,
      source_commit: manifest.source_commit,
      baseline_commit: manifest.baseline_commit,
      runs_per_configuration: 1,
      evals_run: manifest.evaluations.map((evaluation) => evaluation.id),
      executor_model: manifest.executor_model,
      executor_adapter: manifest.executor_adapter,
      executor_version: manifest.executor_version,
      benchmark_wall_seconds: manifest.total_wall_seconds,
    },
    runs,
    summary: {
      with_skill: withSkill,
      old_skill: oldSkill,
      comparison: {
        with_skill_wins: withSkillWins,
        ties,
        old_skill_wins: oldSkillWins,
      },
      delta: {
        macro_pass_rate: withSkill.macro_pass_rate - oldSkill.macro_pass_rate,
        weighted_pass_rate: withSkill.weighted_pass_rate - oldSkill.weighted_pass_rate,
        total_time_seconds: withSkill.total_time_seconds - oldSkill.total_time_seconds,
        total_output_tokens:
          Number.isFinite(withSkill.total_output_tokens) &&
          Number.isFinite(oldSkill.total_output_tokens)
            ? withSkill.total_output_tokens - oldSkill.total_output_tokens
            : null,
      },
    },
    notes: [],
  };

  fs.writeFileSync(
    path.join(iterationDirectory, 'benchmark.json'),
    `${JSON.stringify(benchmark, null, 2)}\n`,
  );

  const runRows = runs.map(
    (run) =>
      `| ${run.eval_id}. ${run.eval_name} | ${run.configuration} | ${run.result.passed}/${run.result.total} | ${(run.result.pass_rate * 100).toFixed(1)}% | ${run.result.time_seconds.toFixed(1)}s | ${formatTokens(run.result.output_tokens)} |`
  );
  const markdown = `# Skill Benchmark: ${manifest.skill_name}

## Summary

| Metric | with_skill | old_skill | Delta |
| --- | --- | --- | --- |
| Macro pass rate | ${(withSkill.macro_pass_rate * 100).toFixed(1)}% | ${(oldSkill.macro_pass_rate * 100).toFixed(1)}% | ${((withSkill.macro_pass_rate - oldSkill.macro_pass_rate) * 100).toFixed(1)}% |
| Weighted assertions | ${withSkill.passed}/${withSkill.total} | ${oldSkill.passed}/${oldSkill.total} | ${withSkill.passed - oldSkill.passed} |
| Total run time | ${withSkill.total_time_seconds.toFixed(1)}s | ${oldSkill.total_time_seconds.toFixed(1)}s | ${(withSkill.total_time_seconds - oldSkill.total_time_seconds).toFixed(1)}s |
| Median run time | ${withSkill.median_time_seconds.toFixed(1)}s | ${oldSkill.median_time_seconds.toFixed(1)}s | ${(withSkill.median_time_seconds - oldSkill.median_time_seconds).toFixed(1)}s |
| Total output tokens | ${formatTokens(withSkill.total_output_tokens)} | ${formatTokens(oldSkill.total_output_tokens)} | ${formatTokens(benchmark.summary.delta.total_output_tokens)} |

with_skill wins ${withSkillWins}, ties ${ties}, old_skill wins ${oldSkillWins}.

## Runs

| Eval | Configuration | Score | Pass rate | Time | Output tokens |
| --- | --- | --- | --- | --- | --- |
${runRows.join('\n')}
`;
  fs.writeFileSync(path.join(iterationDirectory, 'benchmark.md'), markdown);
  console.log(`집계 완료: ${path.join(iterationDirectory, 'benchmark.md')}`);
};

try {
  main();
} catch (error) {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
}