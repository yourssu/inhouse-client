import { z } from 'zod/v4';

export const ValidateTokenResponseSchema = z.object({
  validated: z.boolean(),
});

export const AuthTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string(),
});

export type AuthTokenType = z.infer<typeof AuthTokenResponseSchema>;
