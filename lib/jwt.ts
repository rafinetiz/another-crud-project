import jwt from 'jsonwebtoken';
import { env } from '../lib/utils.js';

/**
 * saat ini hanya support string key
 *
 * TODO:
 * load key from private/public key
 */

const JWT_KEY = env('JWT_KEY', (value: string) => {
  if (!value) {
    throw new Error('JWT_KEY is required but not provided');
  }

  return Buffer.from(value);
});

export const PAYLOAD = {
  ACCESS_TOKEN: 0,
  REFRESH_TOKEN: 1,
} as const;

export type PAYLOAD_TYPE = (typeof PAYLOAD)[keyof typeof PAYLOAD];

export interface JwtPayload {
  type: PAYLOAD_TYPE;
}

export interface AccessTokenPayload extends JwtPayload {
  username: string;
}

export function sign<T extends jwt.JwtPayload>(
  payload: T,
  options?: jwt.SignOptions
): string {
  return jwt.sign(payload, JWT_KEY, options);
}

export function verify<T>(token: string): T & jwt.JwtPayload {
  const data = jwt.verify(token, JWT_KEY, {
    complete: true,
  });

  // semua data payload kita adalah json encoded type, jadi aman untuk diasumsikan jwt akan akan mengembalikan object
  return data.payload as T & jwt.JwtPayload;
}

interface JwtTokenPair {
  access_token: string;
  refresh_token: string;
}

export function createTokenPair(payload: any): JwtTokenPair {
  const access_token_exp = Date.now() + 604800000; // 1 minggu
  const access_token = sign({
    ...payload,
    type: PAYLOAD.ACCESS_TOKEN,
    exp: access_token_exp,
  });

  const refresh_token = sign({
    ...payload,
    type: PAYLOAD.REFRESH_TOKEN,
    exp: access_token_exp + 604800000, // 2 minggu
  });

  return {
    access_token,
    refresh_token,
  };
}
