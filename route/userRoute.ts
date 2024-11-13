import { Router } from "express";
import { getUserByUsername, postUser } from "../controller/user";

const userRouter = Router()

userRouter.post('/register', postUser); 
userRouter.post('/login', getUserByUsername); 
// userRouter.post('login', getUserByUsername)

export default userRouter