import { Request, Response } from "express";
import connectDb from "../database/connect";
import { v4 as uuid } from "uuid";
import { Forum } from "../interfaces/forumInterface";
import { v2 as cloudinary } from "cloudinary";

const collectionName = 'forum'

export const postForum = async (req: Request, res: Response) => {
    try {
        const { postedBy, title, text, img, userId } = req.body;

        if (!postedBy || !text) {
            res.status(400).json({ message: "postedBy and text are required" });
            return
        }

        const id = uuid();

        const { database } = await connectDb();
        const colForum = database.collection(collectionName);

        let imgUrl = null;
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img, {
                folder: 'jagogitar', 
                resource_type: 'image',
            });
            imgUrl = uploadedResponse.secure_url;
        }

        const data = {
            forumId: id,
            userId,
            postedBy,
            title,
            text,
            imgUrl,
            createdAt: new Date(),
        };

        await colForum.insertOne(data);

        res.status(200).json({
            message: 'Forum post created successfully',
            data: {
                forumId: id,
                userId,
                title,
                text,
                imgUrl,
            },
        });
    } catch (error) {
        console.error("Failed to post forum:", error);
        res.status(500).json({ message: "Failed to post forum", error });
    }
};

export const getForumById = async (req: Request, res: Response) => {
    try {
        const { forumId } = req.params;
        if (!forumId){
            console.log(forumId)
            res.status(400).json({ message: "Forum not found." });
            return
        }
        // let { img } = req.body;
        const { database } = await connectDb();
        const col = database.collection(collectionName);
        const data = await col.findOne({ forumId });

        if(!data){
            res.status(404).json({ message: "Data forum not found." });
            return
    	}

        res.status(200).json({
            message: 'get forum success',
            data
        })
    } catch (e){
        console.log("Failed to get forum");
    }
}

export const getForumByUserId = async(req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { database } = await connectDb();
        const col = database.collection(collectionName)

        const data = await col.find({ userId }).toArray()
        if(!data || data.length === 0) {
            res.status(404).json({ message: "Data forum not found." });
            return
        }

        res.status(200).json({
            message: 'get forum success',
            data
        })
    } catch(e){
        console.error(e)
    }
}

export const getAllForum = async (req: Request, res: Response) => {
    try {
        const { database } = await connectDb();
        const col = database.collection(collectionName)
        const data = await col.find().toArray()
        res.status(200).json({
            message: 'get all forum success',
            data
            })
            } catch (e){
                console.error("Failed to get all forums:", e); 
                res.status(500).json({
                    message: 'Failed to get all forums',
                    error: e, 
                });
            }
}

export const replyForum = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        const {forumId} = req.params

        if (!forumId){
            res.status(400).json({ error: "Forum id is required" });
            return;
        }

        const { database } = await connectDb();
        const col = database.collection<Forum>(collectionName);
        const forum = await col.findOne({ forumId });

        if (!forum){
            res.status(404).json({ message: "Forum not found." });
            return
            }

        const colUser = database.collection('user');
        const user = await colUser.findOne({ username: forum.postedBy });
    
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        
        const reply = {
            text,
            username : forum.postedBy,
            userPP: user.userPP,
            createdAt: new Date(),
        }
        

        const result = await col.updateOne(
            { forumId },
            { $push: { replies: reply }}
        );
        
        if (result.modifiedCount === 0) {
            res.status(500).json({ error: "Failed to add reply to the forum." });
            return;
        }

        res.status(200).json({
            message: "Posting comment success",
            reply
        });
    } catch (e){
        console.error("Failed to reply forum", e); 
        res.status(500).json({ error: "Failed to reply to forum", details: e });
    }
}