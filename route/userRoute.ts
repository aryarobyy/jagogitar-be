import { Router } from "express";
import { changeUser, delUser, getAllUser, getUserById, getUserByUsername, postUser, regisMentor } from "../controller/userController";

const userRouter = Router()

userRouter.post('/register', postUser); 
userRouter.post('/login', getUserByUsername); 
userRouter.post('/mentor', regisMentor); 
userRouter.put('/update', changeUser); 
userRouter.get('/all', getAllUser)
userRouter.get('/:userId', getUserById)
userRouter.put('/:userId', changeUser)
userRouter.delete('/:userId', delUser)

export default userRouter