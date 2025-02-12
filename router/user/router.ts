import express from 'express';
import get_user_handler from './get_user_handler.js';

export function UserRouter() {
  const router = express.Router();

  router.get('/', get_user_handler);
  return router;
}
