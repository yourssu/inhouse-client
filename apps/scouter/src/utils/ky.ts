import { HTTPError } from 'ky';

export const isKyHTTPError = (e: any): e is HTTPError => e instanceof HTTPError;

export const getKyHTTPErrorMessage = async (e: HTTPError) => {
  const type = e.response.headers.get('content-type') || '';
  if (!e.response.body) {
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
