import jwt from 'jsonwebtoken';

/**
 * saat ini hanya support string key
 *
 * TODO:
 * load key from private/public key
 */
let key: string | Buffer | null = null;

export const PAYLOAD = {
  ACCESS_TOKEN: 0,
  REFRESH_TOKEN: 1,
} as const;

export type PAYLOAD_TYPE = (typeof PAYLOAD)[keyof typeof PAYLOAD];

export function set_key(_key: string | Buffer) {
  key = _key;
}

export function sign<T extends jwt.JwtPayload>(
  payload: T,
  options?: jwt.SignOptions
): string {
  if (key === null) {
    throw new Error('jsonwebtoken: signin payload failed. key === null');
  }

  return jwt.sign(payload, key, options);
}

export function verify<T>(token: string): T & jwt.JwtPayload {
  if (key === null) {
    throw new Error('jsonwebtoken: verify payload failed. key === null');
  }

  const data = jwt.verify(token, key, {
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
