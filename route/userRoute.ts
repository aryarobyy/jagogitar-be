import { Router } from "express";
import { changeUser, getUserByUsername, postUser } from "../controller/userController";

const userRouter = Router()

userRouter.post('/register', postUser); 
userRouter.post('/login', getUserByUsername); 
userRouter.put('/update', changeUser); 
// userRouter.post('login', getUserByUsername)

export default userRouter