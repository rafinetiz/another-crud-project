import type express from 'express';
import repository_manager from '../../repository/repository_manager.js';
import { Ok } from '../../lib/response.js';

export default async function (req: express.Request, res: express.Response) {
  const userrepo = repository_manager().user_repository;
  const userinfo = await userrepo.GetUser(res.locals.username);

  res.json(Ok(userinfo));
}
