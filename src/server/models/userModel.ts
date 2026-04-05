import db from '../db/connection';

export interface User {
  id?: number;
  name: string;
}

export const getAllUsers = (): User[] => {
  const stmt = db.prepare('SELECT * FROM test_users');
  return stmt.all() as User[];
};

export const createUser = (user: User): User => {
  const stmt = db.prepare('INSERT INTO test_users (name) VALUES (?)');
  const info = stmt.run(user.name);
  return { id: info.lastInsertRowid as number, ...user };
};