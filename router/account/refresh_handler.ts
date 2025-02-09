import type express from 'express';
import zod from 'zod';
import * as jwt from '../../lib/jwt.js';
import { defaultBadRequest } from '../../errors/response_error.js';
import { Ok } from '../../lib/response.js';

const RefreshTokenRequestSchema = zod
  .object({
    refresh_token: zod.string(),
  })
  .required();

export default async function (req: express.Request, res: express.Response) {
  const { refresh_token } = RefreshTokenRequestSchema.parse(req.body);

  try {
    const content = jwt.verify<{
      username: string;
      refresh_token: string;
      type: jwt.PAYLOAD_TYPE;
    }>(refresh_token);

    if (content.type !== jwt.PAYLOAD.REFRESH_TOKEN || !content.exp) {
      throw 'invalid token type';
    }

    if (Date.now() > content.exp) {
      throw 'token expired';
    }

    const tokenpair = jwt.createTokenPair({
      username: content.username,
    });

    res.json(
      Ok({
        access_token: tokenpair.access_token,
        refresh_token: tokenpair.refresh_token,
      })
    );
  } catch (err) {
    throw defaultBadRequest;
  }
}
