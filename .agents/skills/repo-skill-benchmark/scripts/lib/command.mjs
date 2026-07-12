import fs from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const activeChildren = new Set();
let interrupted = false;

const commandLabel = (command, args) => [command, ...args].join(' ');

export const runSync = (
  command,
  args,
  { cwd, env, input, allowFailure = false, maxBuffer = 256 * 1024 * 1024 } = {},
) => {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    input,
    encoding: 'utf8',
    maxBuffer,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !allowFailure) {
    throw new Error(
      `${commandLabel(command, args)} 실패 (${result.status})\n${result.stderr || result.stdout}`,
    );
  }

  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
};

export const runLoggedProcess = ({ command, args, cwd, env, input, stdoutPath, stderrPath }) =>
  new Promise((resolve, reject) => {
    const stdout = fs.openSync(stdoutPath, 'w');
    const stderr = fs.openSync(stderrPath, 'w');
    const startedAtMs = Date.now();
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['pipe', stdout, stderr],
    });

    activeChildren.add(child);
    let settled = false;

    const closeDescriptors = () => {
      fs.closeSync(stdout);
      fs.closeSync(stderr);
    };

    child.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      activeChildren.delete(child);
      closeDescriptors();
      reject(error);
    });

    child.on('close', (exitCode, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      activeChildren.delete(child);
      closeDescriptors();
      const endedAtMs = Date.now();
      resolve({
        exitCode: exitCode ?? 1,
        signal,
        startedAtMs,
        endedAtMs,
        durationMs: endedAtMs - startedAtMs,
      });
    });

    child.stdin.end(input ?? '');
  });

export const installSignalHandlers = () => {
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      interrupted = true;
      for (const child of activeChildren) {
        child.kill('SIGTERM');
      }
      process.exitCode = signal === 'SIGINT' ? 130 : 143;
    });
  }
};

export const assertNotInterrupted = () => {
  if (interrupted) {
    throw new Error('benchmark 실행이 signal로 중단되었습니다.');
  }
};