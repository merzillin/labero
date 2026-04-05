import { Request, Response } from 'express';
import { getAllUsers, createUser as createUserModel } from '../models/userModel';

export const getUsers = (req: Request, res: Response) => {
  const users = getAllUsers();
  res.json(users);
};

export const createUser = (req: Request, res: Response) => {
  const { name } = req.body;
  const newUser = createUserModel({ name });
  res.json(newUser);
};