import type express from 'express';
import zod from 'zod';
import bcrypt from 'bcryptjs';
import repository_manager from '../../repository/repository_manager.js';
import * as jwt from '../../lib/jwt.js';

import { BadRequestError } from '../../errors/response_error.js';
import { Ok } from '../../lib/response.js';

const LoginRequestSchema = zod
  .object({
    username: zod.string().min(3),
    password: zod.string(),
  })
  .required();

export default async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const { username, password } = LoginRequestSchema.parse(req.body);

  const user_repo = repository_manager().user_repository;
  const hashed_password = await user_repo.GetUserPassword(username);

  if (hashed_password === null) {
    // should use 400 bad request or 404 not found?
    throw new BadRequestError('user not found');
  }

  bcrypt.compare(password, hashed_password, (err, success) => {
    if (err || success === false) {
      return next(new BadRequestError('password does not match'));
    }

    const access_token = jwt.sign({
      username,
    });

    res.json(
      Ok({
        username,
        access_token,
      })
    );
  });
}
