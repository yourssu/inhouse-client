import { HTTPError } from 'ky';

export const isKyHTTPError = (error: unknown): error is HTTPError => error instanceof HTTPError;
