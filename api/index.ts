import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import connectDb from '../database/connect';
import userRouter from '../route/userRoute';
import forumRouter from '../route/forumRoute';
import courseRouter from '../route/courseRoute';


dotenv.config();
connectDb();

const app = express();
const PORT = process.env.PORT || 5000;
console.log(PORT)

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json())
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, TypeScript with Express!');
  });

app.use('/user',userRouter)
app.use('/forum', forumRouter)
app.use('/course', courseRouter)
app.use(express.json({ limit: "10mb" })); 

app.listen(PORT, () => {
    console.log(`Server Listerning to ${PORT}`)
})