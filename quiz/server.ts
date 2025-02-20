import { promises as fsPromises } from 'fs';
import path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

/**
 * A type that represents a user object
 */
interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

/**
 * A type that represents the request received by the server
 */
interface UserRequest extends Request {
  users?: User[];
}

// the server application object created by the express server
const app: Express = express();
const port: number = 8000;

// path to test user data
const dataFile = '../data/users.json';


let users: User[] = [];

// a synchronous function that reads the user data from the file
async function readUsersFile() {
  try {
    console.log('Reading file ... ');
    const data = await fsPromises.readFile(path.resolve(__dirname, dataFile));
    users = JSON.parse(data.toString());
    //console.log('Users loaded:', users);
  } catch (err) {
    //console.error('Error reading file:', err);
    throw err;
  }
}

// Load user data on server start
readUsersFile();

// Middleware function to add user data to the request object
const addUsersToRequest = (req: UserRequest, res: Response, next: NextFunction) => {
  //console.log('Checking users:', users);  // Log users data here
  if (users.length > 0) {
    req.users = users;
    next();
  } else {
    console.error('No users loaded');
    return res.status(404).json({ error: { message: 'Users not found', status: 404 } });
  }
};
// apply middleware before the route
//app.use(addUsersToRequest);

// Middleware to verify request origin using CORS
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(addUsersToRequest);

// Route to fetch usernames of all users
app.get('/read/usernames', (req: UserRequest, res: Response) => {
  const usernames = req.users?.map((user) => ({ id: user.id, username: user.username }));
  res.json(usernames);
});

// Route to fetch a user's email by username
app.get('/read/username/:name', async (req: UserRequest, res: Response) => {
  try {
    const { name } = req.params;
    const user = users.find((user) => user.username === name);

    if (!user) {
      console.error(`User not found: ${name}`);
      return res.status(404).json({ error: { message: 'User not found', status: 404 } });
    }

    console.log(`email: ${user.email}`);
    console.log(`Sending response: ${JSON.stringify({ email: user.email })}`);
    return res.status(200).json({ id: user.id, email: user.email });
  } catch (err) {
    console.error('Error fetching user email:', err);
    return res.status(500).json({ error: { message: 'Error getting user email', status: 500 } });
  }
});

// Middleware to parse request body as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to add a new user and save to the data file
app.post('/write/adduser', addUsersToRequest, async (req: UserRequest, res: Response) => {
  try {
    const newUser = req.body as User;
    users.push(newUser);

    await fsPromises.writeFile(path.resolve(__dirname, dataFile), JSON.stringify(users));

    console.log('User saved successfully');
    res.send('done');
  } catch (err) {
    //console.error('Failed to write:', err);
    res.status(500).send('Error saving user');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


