import type express from 'express';
import * as jwt from '../lib/jwt.js';

import {
  defaultBadRequest,
  defaultForbidden,
} from '../errors/response_error.js';

export default function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authorization = req.get('authorization');

  if (!authorization) {
    return next(defaultForbidden);
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next(defaultBadRequest);
  }

  try {
    const payload = jwt.verify<jwt.AccessTokenPayload>(token);

    if (payload.type !== jwt.PAYLOAD.ACCESS_TOKEN) {
      throw 'invalid token';
    }

    res.locals.username = payload.username;
  } catch (err) {
    return next(defaultForbidden);
  }

  next();
}
