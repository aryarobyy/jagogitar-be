import { Router } from "express";
import { getAllForum, getForumById, getForumByUserId, postForum, replyForum } from "../controller/forumController";

const forumRouter = Router();

forumRouter.post('/post', postForum)
forumRouter.get('/all', getAllForum)
forumRouter.get('/:forumId', getForumById)
forumRouter.post('/user/:userId/reply', replyForum)
forumRouter.get('/user/:userId', getForumByUserId)

export default forumRouter 