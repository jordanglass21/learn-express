import express, { Express } from 'express';
import cors from 'cors';
import readUsers from './readUsers';
import writeUsers from './writeUsers';

const app: Express = express();
const port: number = 8000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/read', readUsers);
app.use('/write', writeUsers);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
