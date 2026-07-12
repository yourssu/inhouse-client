#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runSync } from './lib/command.mjs';
import { loadExecutorAdapter } from './lib/executor-adapter.mjs';

const skillDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillPath = path.join(skillDirectory, 'SKILL.md');
const skill = fs.readFileSync(skillPath, 'utf8');

if (!skill.startsWith('---\n') || !/^name: repo-skill-benchmark$/m.test(skill)) {
  throw new Error('SKILL.md frontmatter 또는 name이 올바르지 않습니다.');
}
if (!/^description: .+$/m.test(skill)) {
  throw new Error('SKILL.md description이 없습니다.');
}

const references = [...skill.matchAll(/\[references\/[a-z0-9-]+\.md\)/g)].map((match) => match[0]);
for (const reference of new Set(references)) {
  if (!fs.existsSync(path.join(skillDirectory, reference))) {
    throw new Error(`존재하지 않는 reference: ${reference}`);
  }
}

const scriptDirectory = path.join(skillDirectory, 'scripts');
const scripts = [];
const collectScripts = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectScripts(absolutePath);
    } else if (entry.name.endsWith('.mjs')) {
      scripts.push(absolutePath);
    }
  }
};
collectScripts(scriptDirectory);

for (const scriptPath of scripts) {
  runSync(process.execPath, ['--check', scriptPath]);
  const content = fs.readFileSync(scriptPath, 'utf8');
  if (/\/Users\/[a-z0-9._-]+\//i.test(content)) {
    throw new Error(`사용자 절대 경로가 포함된 script: ${scriptPath}`);
  }
}

const adapterDirectory = path.join(skillDirectory, 'adapters');
const adapters = fs.readdirSync(adapterDirectory).filter((fileName) => fileName.endsWith('.json'));
for (const adapterFile of adapters) {
  loadExecutorAdapter({
    adapterPath: path.join(adapterDirectory, adapterFile),
    commandOverride: undefined,
    model: undefined,
    unsafe: false,
  });
}

runSync(process.execPath, [path.join(scriptDirectory, 'run-benchmark.mjs'), '--help']);
console.log(
  `repo-skill-benchmark: ${scripts.length}개 script, ${adapters.length}개 adapter 구조 검증 성공`,
);