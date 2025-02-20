import  { promises as fsPromises } from 'fs';
import path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

// A type that represents a user object
interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

// A type that represents the request received by the server
interface UserRequest extends Request {
  users?: User[];
}

// the server application object created by the express server
const app: Express = express();
const port: number = 8000;

// path to test user data
const dataFile = './data/users.json';

let users: User[];

//  a synchronous function that reads the user data from the file
async function readUsersFile() {
  try {
    console.log('reading file ... ');
    const data = await fsPromises.readFile(path.resolve(__dirname, dataFile));
    users = JSON.parse(data.toString());
    console.log('File read successfully');
  } catch (err) {
    console.error('Error reading file:', err);
    throw err;
  }
}

readUsersFile();

// a middleware function that adds the users data to the request object
const addMsgToRequest = (req: UserRequest, res: Response, next: NextFunction) => {
  if (users) {
    req.users = users;
    next();
  } else {
    return res.json({
      error: { message: 'users not found', status: 404 }
    });
  }
};

// a middleware function the verifies the origin of the request using a cors package
app.use(cors({ origin: 'http://localhost:3000' }));
// adds the middleware function to the GET route
app.use('/read/usernames', addMsgToRequest);

// GET route that returns a list of usernames
app.get('/read/usernames', (req: UserRequest, res: Response) => {
  let usernames = req.users?.map((user) => {
    return { id: user.id, username: user.username };
  });
  res.send(usernames);
});


// middleware function that parses the request body to json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// adds the middleware function to the POST route
app.use('/write/adduser', addMsgToRequest);

// POST route that adds a new user to the list
app.post('/write/adduser', async (req: UserRequest, res: Response) => {
  try {
    let newuser = req.body as User;
    users.push(newuser);
    
    await fsPromises.writeFile(
      path.resolve(__dirname, dataFile), 
      JSON.stringify(users)
    );
    
    console.log('User Saved');
    res.send('done');
  } catch (err) {
    console.log('Failed to write:', err);
    res.status(500).send('Error saving user');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

