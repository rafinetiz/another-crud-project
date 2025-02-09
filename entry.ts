import 'dotenv/config';
import zod from 'zod';
import express from 'express';
import logging from './lib/logging.js';
import Database from './lib/database.js';

import { env } from './lib/utils.js';
import { AccountRouter } from './router/account/router.js';
import {
  BadRequestError,
  defaultInternalServer,
  defaultNotFound,
  ResponseError,
} from './errors/response_error.js';
import { RepositoryManager } from './repository/repository_manager.js';

import * as jwt from './lib/jwt.js';

jwt.set_key(
  env('JWT_KEY', (value) => {
    if (!value) {
      throw new Error('JWT_KEY is required but not provided');
    }

    return Buffer.from(value);
  })
);

const zod_custom_error: zod.ZodErrorMap = (issues, ctx) => {
  if (issues.code === zod.ZodIssueCode.invalid_type) {
    if (ctx.defaultError === 'Required') {
      return { message: `${issues.path[0]} is required` };
    }

    return {
      message: `invalid type of '${issues.path[0]}'. expected '${issues.expected}' but received '${issues.received}'`,
    };
  }

  return { message: `${issues.path[0]}: ${ctx.defaultError}` };
};

zod.setErrorMap(zod_custom_error);

const app = express();
app.set('etag', false);
app.set('x-powered-by', false);

const host = env('APP_HOST', 'localhost');
const port = env('APP_PORT', 8000);

app.use(express.json());
app.use('/account', AccountRouter());

// untuk testing error
app.get('/fatal', (_, _res) => {
  throw new Error('fatal error');
});

// not found handler
app.use(
  (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
    next(defaultNotFound)
);

// Semua error yang dilemparkan oleh router akan di handling middleware ini
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    let error: ResponseError;

    if (err instanceof ResponseError) {
      error = err;
    } else if (err instanceof zod.ZodError) {
      // hanya kirimkan issue pertama saja
      error = new BadRequestError(err.issues[0].message);
    } else {
      error = defaultInternalServer;
      logging.error(`internal server error! ${err.stack}`);
    }

    res.status(error.status_code).json({ message: error.message });
  }
);

const conn = Database.init({
  host: env('DB_HOST', 'localhost'),
  port: env('DB_PORT', 5432),
  user: env('DB_USER', 'postgres'),
  password: env('DB_PASS', 'postgres'),
  database: env('DB_NAME', 'postgres'),
});

conn.client
  .connect()
  .then(() => {
    RepositoryManager.init(conn);

    logging.info('database connected. starting up server!');

    app.listen(port, host, () => {
      logging.info(`app serving at ${host}:${port}`);
    });
  })
  .catch((err) => {
    logging.error(`cannot connect to database! error: ${err.message}`);
    process.exit(1);
  });
