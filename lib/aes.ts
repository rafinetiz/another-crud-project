import { createCipheriv, createDecipheriv } from 'node:crypto';
import { env } from './utils.js';

const AES_KEY = env('AES_KEY', (value) => {
  if (!value) {
    throw new Error('AES_KEY is required but not provided');
  }

  if (value.length != 16) {
    throw new Error('AES_KEY should have exact 16 length');
  }

  return Buffer.from(value);
});

const AES_IV = env('AES_IV', (value) => {
  if (!value) {
    throw new Error('AES_IV is required but not provided');
  }

  if (value.length < 8) {
    throw new Error('AES_IV should have at least 8 character length');
  }

  return Buffer.from(value);
});

interface AESEncryptResult {
  tag: Buffer<ArrayBuffer>;
  ciphertext: Buffer<ArrayBuffer>;
}

export function encrypt(payload: any): AESEncryptResult {
  const cipher = createCipheriv('aes-128-gcm', AES_KEY, AES_IV);
  const ciphertext = Buffer.concat([
    cipher.update(payload, 'utf8'),
    cipher.final(),
  ]);

  return {
    tag: cipher.getAuthTag(),
    ciphertext: ciphertext,
  };
}

type AESDecryptPayload = AESEncryptResult;

export function decrypt(payload: AESDecryptPayload): Buffer<ArrayBuffer> {
  const cipher = createDecipheriv('aes-128-gcm', AES_KEY, AES_IV);
  cipher.setAuthTag(payload.tag);

  const plaintext = Buffer.concat([
    cipher.update(payload.ciphertext),
    cipher.final(),
  ]);

  return plaintext;
}
