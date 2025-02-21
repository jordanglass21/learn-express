import { Request, Response, Router } from 'express';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { User, UserRequest } from './types';
import { addUsersToRequest } from './readUsers';

const router = Router();
const dataFile = path.resolve(__dirname, '../data/users.json');

// Route to add a new user and save it to the data file
router.post('/adduser', addUsersToRequest, async (req: UserRequest, res: Response) => {
  try {
    const newUser: User = req.body;
    
    if (!newUser || !newUser.id || !newUser.username || !newUser.email) {
      return res.status(400).json({ error: { message: 'Invalid user data', status: 400 } });
    }

    req.users?.push(newUser);
    await fsPromises.writeFile(dataFile, JSON.stringify(req.users, null, 2));

    res.status(201).send({ message: 'User added successfully' });
  } catch (err) {
    res.status(500).json({ error: { message: 'Error saving user', status: 500 } });
  }
});

export default router;
