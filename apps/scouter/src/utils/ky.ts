import { HTTPError } from 'ky';

export const isKyHTTPError = (e: any): e is HTTPError => e instanceof HTTPError;

const isErrorResponseBody = (value: unknown): value is { detail?: string; message?: string } => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return (
    (!('detail' in value) || typeof value.detail === 'string') &&
    (!('message' in value) || typeof value.message === 'string')
  );
};

const getHTTPErrorDataMessage = (data: unknown) => {
  if (typeof data === 'string') {
    return data;
  }
  if (isErrorResponseBody(data)) {
    return data.detail ?? data.message;
  }
  return undefined;
};

export const getKyHTTPErrorMessage = async (e: HTTPError) => {
  const dataMessage = getHTTPErrorDataMessage(e.data);
  if (dataMessage) {
    return dataMessage;
  }
  const type = e.response.headers.get('content-type') || '';
  if (!e.response.body || e.response.bodyUsed) {
    return e.message;
  }
  if (type.includes('json')) {
    const body = await e.response.json<{ detail?: string; message?: string }>();
    return body.detail ?? body.message;
  }
  if (type.includes('text')) {
    return await e.response.text();
  }
  return undefined;
};

export const makeFormData = <T extends object>(data: T) => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined) {
      formData.append(key, `${data[key]}`);
    }
  }
  return formData;
};
