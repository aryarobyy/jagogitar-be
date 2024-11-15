import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './database/connect';
import userRouter from './route/userRoute';
import forumRouter from './route/forumRoute';

dotenv.config();
connectDb();

const app = express();
const PORT = process.env.PORT || 5000;
console.log(PORT)

app.use(express.json())
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, TypeScript with Express!');
  });

app.use('/user',userRouter)
app.use('/forum', forumRouter)

app.listen(PORT, () => {
    console.log(`Server Listerning to ${PORT}`)
})