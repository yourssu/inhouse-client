import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
export const defaultAdapterPath = path.join(skillDirectory, 'adapters', 'codex.json');

const stringArray = (value, label, fallback = []) => {
  if (value === undefined) {
    return fallback;
  }
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`${label}은 문자열 배열이어야 합니다.`);
  }
  return value;
};

const substitute = (value, variables) =>
  value.replace(/\{([a-z_]+)\}/g, (match, name) => {
    if (!(name in variables)) {
      throw new Error(`executor adapter의 알 수 없는 placeholder: ${match}`);
    }
    return variables[name];
  });

export const loadExecutorAdapter = ({ adapterPath, commandOverride, model, unsafe }) => {
  const resolvedPath = path.resolve(adapterPath ?? defaultAdapterPath);
  const raw = fs.readFileSync(resolvedPath);
  const data = JSON.parse(raw.toString('utf8'));

  if (data.schema_version !== 1 || typeof data.name !== 'string' || data.name.length === 0) {
    throw new Error(`executor adapter schema 또는 name이 올바르지 않습니다: ${resolvedPath}`);
  }
  if (typeof data.command !== 'string' || data.command.length === 0) {
    throw new Error(`executor adapter command가 없습니다: ${resolvedPath}`);
  }
  if (data.prompt_mode !== 'stdin') {
    throw new Error(`지원하지 않는 executor prompt_mode: ${data.prompt_mode}`);
  }
  if (!['file', 'stdout'].includes(data.report_mode)) {
    throw new Error(`지원하지 않는 executor report_mode: ${data.report_mode}`);
  }
  if (!['codex-jsonl', 'text'].includes(data.transcript_format)) {
    throw new Error(`지원하지 않는 transcript_format: ${data.transcript_format}`);
  }
  if (
    data.environment !== undefined &&
    (typeof data.environment !== 'object' ||
      data.environment === null ||
      Array.isArray(data.environment) ||
      Object.values(data.environment).some((value) => typeof value !== 'string'))
  ) {
    throw new Error('executor adapter environment는 문자열 value의 객체여야 합니다.');
  }

  const unsafeArgs = stringArray(data.unsafe_args, 'unsafe_args');
  if (unsafe && unsafeArgs.length === 0) {
    throw new Error(`${data.name} adapter는 unsafe mode를 선언하지 않았습니다.`);
  }

  const modelArgs = stringArray(data.model_args, 'model_args');
  const environment = data.environment ?? {};
  const allTemplateValues = [
    ...stringArray(data.base_args, 'base_args'),
    ...stringArray(data.safe_args, 'safe_args'),
    ...unsafeArgs,
    ...modelArgs,
    ...stringArray(data.trailing_args, 'trailing_args'),
    ...Object.values(environment),
  ];
  if (model && !allTemplateValues.some((value) => value.includes('{model}'))) {
    throw new Error(`${data.name} adapter는 model placeholder를 사용하지 않습니다.`);
  }
  if (
    data.report_mode === 'file' &&
    !allTemplateValues.some((value) => value.includes('{report_path}'))
  ) {
    throw new Error(`${data.name} file report adapter에 {report_path}가 없습니다.`);
  }

  const spec = {
    name: data.name,
    command: commandOverride ?? data.command,
    versionArgs: stringArray(data.version_args, 'version_args'),
    baseArgs: stringArray(data.base_args, 'base_args'),
    safetyArgs: unsafe ? unsafeArgs : stringArray(data.safe_args, 'safe_args'),
    modelArgs: model ? modelArgs : [],
    trailingArgs: stringArray(data.trailing_args, 'trailing_args'),
    environment,
    reportMode: data.report_mode,
    transcriptFormat: data.transcript_format,
  };

  return {
    path: resolvedPath,
    source: raw,
    sha256: crypto.createHash('sha256').update(raw).digest('hex'),
    ...spec,
    buildInvocation({ promptPath, reportPath, sandbox }) {
      const variables = {
        model: model ?? '',
        prompt_path: promptPath,
        report_path: reportPath,
        sandbox,
      };
      const args = [
        ...spec.baseArgs,
        ...spec.safetyArgs,
        ...spec.modelArgs,
        ...spec.trailingArgs,
      ].map((value) => substitute(value, variables));
      const env = Object.fromEntries(
        Object.entries(spec.environment).map(([key, value]) => [key, substitute(value, variables)]),
      );
      return { command: spec.command, args, env };
    },
  };
};