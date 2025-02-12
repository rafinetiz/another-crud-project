import pg from 'pg';

interface DatabaseOptions {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export class Transaction {
  private _client: pg.PoolClient;
  private is_begin: boolean = false;

  constructor(client: pg.PoolClient) {
    this._client = client;
  }

  public async query(query: string, values: any[]) {
    if (!this.is_begin) {
      await this._client.query('BEGIN');
      this.is_begin = true;
    }

    try {
      this._client.query(query, values);
    } catch (err) {
      await this.rollback();
    }
  }

  public async commit() {
    await this._client.query('COMMIT');
    this._client.release();
  }

  public async rollback() {
    await this._client.query('ROLLBACK');
    this._client.release();
  }
}

export default class Database {
  public static instance: Database | null = null;
  private _pool: pg.Pool;

  /** global postgres client digunakan hanya untuk non-transaction query! */
  private _client: pg.Client;

  constructor(options?: DatabaseOptions) {
    //this._user = options?.user;

    this._client = new pg.Client({
      host: options?.host,
      port: options?.port,
      user: options?.user,
      password: options?.password,
      database: options?.database,
    });

    this._pool = new pg.Pool({
      host: options?.host,
      port: options?.port,
      user: options?.user,
      password: options?.password,
      database: options?.database,
      max: 100,
    });
  }

  public static init(options?: DatabaseOptions): Database {
    Database.instance = new Database(options);

    return Database.instance;
  }

  public static getInstance(): Database {
    if (Database.instance === null) {
      throw new Error('database instance === null, lupa initialisasi?');
    }

    return Database.instance;
  }

  /**
   * global postgres client digunakan hanya untuk non-transaction query!\
   * gunakan client dari createTransaction() untuk transaction query!
   */
  public get client(): pg.Client {
    return this._client;
  }

  /**
   * buat client baru untuk digunakan sebagai transaksi.\
   * setiap error yang terjadi di query() akan otomatis me-rollback datanya atau juga bisa manual panggil .rollback()
   *
   * commit() untuk men-commit datanya (lupa bahasa indonesia apa xD)\
   * rollback() untuk men-rollback datanya
   * @returns
   */
  public async createTransaction(): Promise<Transaction> {
    return new Transaction(await this._pool.connect());
  }
}
