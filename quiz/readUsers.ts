import { Request, Response, NextFunction, Router } from 'express';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { User, UserRequest } from './types';

const router = Router();
const dataFile = path.resolve(__dirname, '../data/users.json');

let users: User[] = [];

// Load user data from file when the server starts
(async () => {
  try {
    const data = await fsPromises.readFile(dataFile, 'utf-8');
    users = JSON.parse(data);
    console.log('Users loaded successfully.');
  } catch (err) {
    console.error('Error loading users:', err);
  }
})();

// Middleware to add users to the request object
export const addUsersToRequest = (req: UserRequest, res: Response, next: NextFunction) => {
  if (users.length > 0) {
    req.users = users;
    next();
  } else {
    return res.status(404).json({ error: { message: 'Users not found', status: 404 } });
  }
};

// Route to fetch usernames of all users
router.get('/usernames', addUsersToRequest, (req: UserRequest, res: Response) => {
  const usernames = req.users?.map(user => ({ id: user.id, username: user.username }));
  res.json(usernames);
});

// Route to fetch a user's email by username
router.get('/username/:name', addUsersToRequest, (req: UserRequest, res: Response) => {
  const { name } = req.params;
  const user = users.find(user => user.username === name);

  if (!user) {
    return res.status(404).json({ error: { message: 'User not found', status: 404 } });
  }
  console.log("email: ", user.email);

  return res.status(200).json([{ id: user.id, email: user.email }]);
});

export default router;
