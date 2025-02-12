import Database from '../lib/database.js';

export interface UserModel {
  user_id: number;
  user_name: string;
}

export interface AddUserModel extends Omit<UserModel, 'user_id'> {
  user_password: string;
}

export default class UserRepository {
  private _conn: Database;

  constructor(conn: Database) {
    this._conn = conn;
  }

  /**
   * cek apakah username sudah ada di database.
   * true jika ada, false sebaliknya.
   * akan melemparkan error jika query gagal
   *
   * @param username
   * @returns
   */
  public async CheckUsername(
    username: UserModel['user_name']
  ): Promise<boolean> {
    const query = await this._conn.client.query<{ count: string }>({
      text: 'SELECT COUNT(user_name) FROM tbl_users WHERE user_name=$1',
      values: [username],
    });

    return query.rows[0].count === '1' ? true : false;
  }

  /**
   * tambah user ke database.
   * akan melemparkan error jika query gagal
   *
   * callback akan di panggil setelah insert query dengan demikian
   * semua error yang terjadi didalam callback otomatis membatalkan query (ROLLBACK)
   * @param user user object
   * @param callback callback
   * @returns
   */
  public async AddUser(user: AddUserModel, callback: () => void) {
    const client = await this._conn.createTransaction();

    try {
      await client.query(
        'INSERT INTO tbl_users(user_name, user_password) VALUES ($1, $2)',
        [user.user_name, user.user_password]
      );

      await callback();
      await client.commit();
    } catch (err) {
      await client.rollback();
      throw err;
    }
  }

  /**
   * hapus user dari database.
   * akan melemparkan error jika gagal
   *
   * @param username username
   */
  public async DeleteUser(username: UserModel['user_name']): Promise<void> {
    await this._conn.client.query('DELETE FROM tbl_users WHERE user_name=$1', [
      username,
    ]);
  }

  /**
   * ambil semua kolom (kecuali user_password) user data dari database.
   * mengembalikan null jika user tidak ada.
   * akan melemparkan error jika query gagal
   *
   * @param username
   */
  public async GetUser(
    username: UserModel['user_name']
  ): Promise<UserModel | null> {
    const query = await this._conn.client.query<UserModel>(
      'SELECT user_id, user_name FROM tbl_users WHERE user_name=$1 LIMIT 1',
      [username]
    );

    if (query.rowCount === 0) {
      return null;
    }

    return query.rows[0];
  }

  public async GetUserPassword(
    username: UserModel['user_name']
  ): Promise<string | null> {
    const query = await this._conn.client.query(
      'SELECT user_password FROM tbl_users WHERE user_name=$1 LIMIT 1',
      [username]
    );

    if (query.rowCount === 0) {
      return null;
    }

    return query.rows[0].user_password;
  }
}
