import { Router } from "express";
import { postUser } from "../controller/user";

const userRouter = Router()

userRouter.post('/register', postUser); 

export default userRouter