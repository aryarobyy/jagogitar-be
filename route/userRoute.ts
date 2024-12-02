import { Router } from "express";
import { changeUser, getUserById, getUserByUsername, postUser } from "../controller/userController";

const userRouter = Router()

userRouter.post('/register', postUser); 
userRouter.post('/login', getUserByUsername); 
userRouter.put('/update', changeUser); 
userRouter.get('/:userId', getUserById)
userRouter.put('/:userId', changeUser)

export default userRouter