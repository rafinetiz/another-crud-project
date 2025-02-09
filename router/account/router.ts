import express from 'express';
import register_handler from './register_handler.js';

export function AccountRouter() {
  const router = express.Router();

  router.post('/register', register_handler);

  return router;
}
