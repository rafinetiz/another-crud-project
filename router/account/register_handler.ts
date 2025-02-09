import type express from 'express';
import zod from 'zod';
import bcrypt from 'bcryptjs';
import RepositoryManager from '../../repository/repository_manager.js';
import * as jwt from '../../lib/jwt.js';

import { Ok } from '../../lib/response.js';
import {
  ConflictError,
  InternalServerError,
} from '../../errors/response_error.js';
import logging from '../../lib/logging.js';

const RegisterBodySchema = zod
  .object({
    username: zod.string().min(3),
    password: zod.string().min(6),
  })
  .required();

export default async function (req: express.Request, res: express.Response) {
  const { username, password } = RegisterBodySchema.parse(req.body);

  const user_repo = RepositoryManager().user_repository;

  if (await user_repo.CheckUsername(username)) {
    throw new ConflictError('username sudah terdaftar');
  }

  const hashed_password = await bcrypt.hash(password, 8);

  try {
    await user_repo.AddUser(
      {
        user_name: username,
        user_password: hashed_password,
      },
      () => {
        const access_token = jwt.sign({ username });

        res.json(
          Ok({
            access_token,
          })
        );
      }
    );
  } catch (error) {
    logging.error((error as Error).stack as string);
    throw new InternalServerError('gagal membuat akun. internal server error');
  }
}
