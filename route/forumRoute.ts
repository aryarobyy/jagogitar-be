import { Router } from "express";
import { delForum, getAllForum, getForumById, getForumByUserId, postForum, replyForum } from "../controller/forumController.js";

const forumRouter = Router();

forumRouter.post('/post', postForum)
forumRouter.get('/all', getAllForum)
forumRouter.get('/:forumId', getForumById)
forumRouter.post('/reply', replyForum)
forumRouter.get('/user/:userId', getForumByUserId)
forumRouter.delete('/:forumId', delForum)

export default forumRouter 