import { __root, log, writeFileEnsureDirectorySync } from './utils';

const SCHEMA_URL = 'https://api.dev.scouter.yourssu.com/v3/api-docs';
const TARGET_FILE = `${__root}/schema.json`;

async function fetchSchema() {
  log.running(`${SCHEMA_URL}에서 스키마를 가져오고 있어요...`);
  try {
    const response = await fetch(SCHEMA_URL);
    if (!response.ok) {
      log.error(`스키마를 가져오는데 실패했어요: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    log.running(`${TARGET_FILE}에 스키마를 저장하고 있어요...`);
    writeFileEnsureDirectorySync(TARGET_FILE, JSON.stringify(data, null, 2) + '\n');
    log.success('schema.json 업데이트를 성공적으로 완료했어요.');
  } catch (error) {
    let errorMessage = '알 수 없는 에러에요';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    log.error(`제대로 실행되지 못했어요: ${errorMessage}`);
  }
}

fetchSchema();
