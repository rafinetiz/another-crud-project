import type express from 'express';
import zod from 'zod';

import { Ok } from '../../lib/response.js';
import {
  defaultBadRequest,
  NotAcceptableError,
} from '../../errors/response_error.js';
import repository_manager from '../../repository/repository_manager.js';
import { decrypt, encrypt } from '../../lib/aes.js';

const DeleteRequestSchema = zod
  .object({
    token: zod.string().optional().nullable(),
  })
  .required();

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

    const plaintext = decrypt({
      ciphertext: Buffer.from(ciphertext, 'base64'),
      tag: Buffer.from(authtag, 'base64'),
    });

    const { request_time } = JSON.parse(plaintext.toString());
    const elapse_time = Date.now() - request_time;

    if (elapse_time > 600000) {
      throw new NotAcceptableError('request not accepted');
    }

    const user_repo = repository_manager().user_repository;
    await user_repo.DeleteUser(res.locals.username);

    res.json(Ok());
  } else {
    const payload = JSON.stringify({
      request_time: Date.now(),
    });

    const { ciphertext, tag } = encrypt(payload);
    const token = ciphertext.toString('base64') + '$' + tag.toString('base64');

    res.json(Ok({ token }));
  }
}
