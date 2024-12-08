import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import connectDb from './database/connect.js';
import userRouter from './route/userRoute.js';
import forumRouter from './route/forumRoute.js';
import courseRouter from './route/courseRoute.js';

dotenv.config();
connectDb();

const app = express();
const PORT = process.env.PORT || 5000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, TypeScript with Express!');
});

app.use('/user', userRouter)
app.use('/forum', forumRouter)
app.use('/course', courseRouter)

export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server Listening to ${PORT}`)
    });
}