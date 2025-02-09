import type express from 'express';
import zod from 'zod';
import { createCipheriv, createDecipheriv } from 'node:crypto';

import { Ok } from '../../lib/response.js';
import { env } from '../../lib/utils.js';
import {
  defaultBadRequest,
  NotAcceptableError,
} from '../../errors/response_error.js';
import repository_manager from '../../repository/repository_manager.js';

const DeleteRequestSchema = zod
  .object({
    token: zod.string().optional().nullable(),
  })
  .required();

/**
 * TODO: move this aes thing to its own module
 */
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

/**
 * alur mengahapus adalah
 * request pertama API yang mengembalikan token. untuk mengkonfirmasi apakah aksi user benar" dilakukan.
 * jika user mengkonfirmasi kirim kembali request beserta token yang didapatkan sebelumnya
 * note: token hanya berlaku selama 10 menit
 */
export default async function (req: express.Request, res: express.Response) {
  const body = DeleteRequestSchema.parse(req.body);

  if (body.token) {
    const [ciphertext, authtag] = body.token.split('$');

    if (!ciphertext || !authtag) {
      throw defaultBadRequest;
    }

    const decipher = createDecipheriv('aes-128-gcm', AES_KEY, AES_IV);
    decipher.setAuthTag(Buffer.from(authtag, 'base64'));

    const plaintext = Buffer.concat([
      decipher.update(ciphertext, 'base64'),
      decipher.final(),
    ]);

    const { request_time } = JSON.parse(plaintext.toString());
    const elapse_time = Date.now() - request_time;

    if (elapse_time > 600000) {
      throw new NotAcceptableError('request not accepted');
    }

    const user_repo = repository_manager().user_repository;
    await user_repo.DeleteUser(res.locals.username);
    res.json(Ok());
  } else {
    // create token
    const cipher = createCipheriv('aes-128-gcm', AES_KEY, AES_IV);
    const payload = JSON.stringify({
      request_time: Date.now(),
    });

    const result = Buffer.concat([
      cipher.update(payload, 'utf8'),
      cipher.final(),
    ]);

    const token =
      result.toString('base64') + '$' + cipher.getAuthTag().toString('base64');

    res.json(
      Ok({
        token: token,
      })
    );
  }
}
