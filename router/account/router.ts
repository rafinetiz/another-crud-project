import express from 'express';
import register_handler from './register_handler.js';
import login_handler from './login_handler.js';

export function AccountRouter() {
  const router = express.Router();

  router.post('/register', register_handler);
  router.post('/login', login_handler);

  return router;
}
