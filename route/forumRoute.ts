import { Router } from "express";
import { getForumById, postFroum } from "../controller/forumController";

const forumRouter = Router();

forumRouter.post('/post', postFroum)
forumRouter.get('/:id', getForumById)

export default forumRouter 