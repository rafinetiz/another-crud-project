import type express from 'express';
import * as jwt from '../lib/jwt.js';

import { defaultForbidden } from '../errors/response_error.js';

export default function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authorization = req.get('authorization');

  if (!authorization) {
    return next(defaultForbidden);
  }

  try {
    const payload = jwt.verify<jwt.AccessTokenPayload>(authorization);

    if (payload.type !== jwt.PAYLOAD.ACCESS_TOKEN) {
      throw 'invalid token';
    }

    res.locals.username = payload.username;
  } catch (err) {
    return next(defaultForbidden);
  }

  next();
}
