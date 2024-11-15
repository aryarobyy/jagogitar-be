import { Request, Response } from "express";
import connectDb from "../database/connect";
import { v4 as uuid } from "uuid";
import { getUserByUsername } from "./userController";

const collectionName = 'post'

export const postFroum = async (req: Request, res: Response) =>{
    try{
        const { postedBy, title, text } = req.body;
        if ( !postedBy || !text )console.log("PostedBy and Text is required");

        const id = uuid();
        const { database } = await connectDb();
        const colForum = database.collection(collectionName);
        // const colUser = database.collection('user');
        // const user = await colUser.findOne({ username: postedBy });
        // if (!user) {
		// 	res.status(404).json({ error: "User not found" });
        //     return;
		// }

        // let img = req.body
        // if (img) {
		// 	const uploadedResponse = await cloudinary.uploader.upload(img);
		// 	img = uploadedResponse.secure_url;
		// }

        const data = {
            // postedBy: user,
            forumId: id,
            title,
            text,
            createdAt : new Date()
        }

        await colForum.insertOne(data)

        res.status(200).json({
            message: 'Posting forum success',
            data
        })
    } catch (e){
        console.log("Failed to post user");
    }
}

export const getForumById = async (req: Request, res: Response) => {
    try {
        const { forumId } = req.body;
        // let { img } = req.body;
        const { database } = await connectDb();
        const col = database.collection(collectionName);
        const data = await col.findOne({ forumId });

        // if (!postedBy || !text) {
		// 	res.status(400).json({ error: "Postedby and text fields are required" });
		// }

        res.status(200).json({
            message: 'Posting forum success',
            data
        })
    } catch (e){
        console.log("Failed to post user");
    }
}