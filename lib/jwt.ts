import jwt from 'jsonwebtoken';

/**
 * saat ini hanya support string key
 *
 * TODO:
 * load key from private/public key
 */
let key: string | Buffer | null = null;

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

  try {
    const token = jwt.sign(payload, key, options);

    return token;
  } catch (error: any) {
    (error as Error).message =
      'jsonwebtoken: signin payload failed.' + (error as Error).message;

    throw error;
  }
}

export function verify<T>(token: string): T & jwt.JwtPayload {
  if (key === null) {
    throw new Error('jsonwebtoken: verify payload failed. key === null');
  }

  try {
    const data = jwt.verify(token, key, {
      complete: true,
    });

    // semua data payload kita adalah json encoded type, jadi aman untuk diasumsikan jwt akan akan mengembalikan object
    return data.payload as T & jwt.JwtPayload;
  } catch (error) {
    (error as Error).message =
      'jsonwebtoken: verify payload failed.' + (error as Error).message;

    throw error;
  }
}
