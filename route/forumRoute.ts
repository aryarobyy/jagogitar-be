import { Router } from "express";
import { getAllForum, getForumById, postForum, replyForum } from "../controller/forumController";

const forumRouter = Router();

forumRouter.post('/post', postForum)
forumRouter.get('/all', getAllForum)
forumRouter.get('/:forumId', getForumById)
forumRouter.post('/:forumId/reply', replyForum)

export default forumRouter 