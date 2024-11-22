import { Request, Response } from "express";
import connectDb from "../database/connect";
import { v4 as uuid } from "uuid";
import { Forum } from "../interfaces/forumInterface";
import { v2 as cloudinary } from "cloudinary";

const collectionName = 'forum'

export const postFroum = async (req: Request, res: Response) =>{
    try{
        const { postedBy, title, text } = req.body;
        if ( !text )console.log("PostedBy and Text is required");

        const id = uuid();
        const { database } = await connectDb();
        const colForum = database.collection(collectionName);
        const colUser = database.collection('user');
        const user = await colUser.findOne({ username: postedBy });
        if (!user) {
			res.status(404).json({ error: "User not found" });
            return;
		}

        let img = req.body
        if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

        const data = {
            postedBy: user,
            forumId: id,
            title,
            text,
            createdAt : new Date()
        }

        await colForum.insertOne(data)

        res.status(200).json({
            message: 'Posting forum success',
            data:{
                forumId: id,
                title,
                text,
            }
        })
    } catch (e){
        console.log("Failed to post user");
    }
}

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
            res.status(404).json({ message: "Data forum found." });
            return
        }
        // if (!postedBy || !text) {
		// 	res.status(400).json({ error: "Postedby and text fields are required" });
		// }

        res.status(200).json({
            message: 'get forum success',
            data
        })
    } catch (e){
        console.log("Failed to get forum");
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