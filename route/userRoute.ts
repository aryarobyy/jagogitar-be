import { Router } from "express";
import { changeUser, delUser, getAllUser, getUserById, getUserByUsername, loginUser, postUser, regisMentor } from "../controller/userController.js";

const userRouter = Router()

userRouter.post('/register', postUser); 
userRouter.post('/login', loginUser); 
userRouter.post('/mentor', regisMentor); 
userRouter.put('/update', changeUser); 
userRouter.get('/all', getAllUser)
userRouter.get('/id/:userId', getUserById)
userRouter.get('/username/:username', getUserByUsername)
userRouter.put('/:userId', changeUser)
userRouter.delete('/:userId', delUser)

export default userRouter