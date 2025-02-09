import pg from 'pg';
import UserRepository from './user_repository.js';
import Database from '../lib/database.js';

export class RepositoryManager {
  private static _instance: RepositoryManager | null = null;
  private _user_repo: UserRepository;

  constructor(conn: Database) {
    this._user_repo = new UserRepository(conn);
  }

  public static init(conn: Database) {
    RepositoryManager._instance = new RepositoryManager(conn);
  }

  public static getInstance(): RepositoryManager {
    if (RepositoryManager._instance === null) {
      throw new Error('repository manager === null. lupa initialisasi?');
    }

    return RepositoryManager._instance;
  }

  public get user_repository() {
    return this._user_repo;
  }
}

export default function () {
  return RepositoryManager.getInstance();
}
