import { Router } from "express";
import { getForumById, postFroum, replyForum } from "../controller/forumController";

const forumRouter = Router();

forumRouter.post('/post', postFroum)
forumRouter.get('/:forumId', getForumById)
forumRouter.post('/:forumId/reply', replyForum)

export default forumRouter 