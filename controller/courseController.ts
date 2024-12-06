import { Request, Response } from "express";
import { v4 } from "uuid";
import connectDb from "../database/connect";
import { v2 as cloudinary } from "cloudinary";

const collectionName = 'course';

export const postCourse = async (req: Request, res: Response) => {
    try{
        const { userId, postedBy, title, desc, vidUrl, img } = req.body;

        if(!title || !desc || !vidUrl){
            res.status(400).json({ message: "All fields are required." });
            return;
        }

        const id = v4();
        const {database} = await connectDb();
        const col = database.collection(collectionName);

        let imgUrl = null;
        if (img) {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(img, {
                    folder: 'jagogitar',
                    resource_type: 'image',
                });
                imgUrl = uploadedResponse.secure_url;
            } catch (cloudinaryError) {
                console.error("Error uploading image to Cloudinary:", cloudinaryError);
                res.status(500).json({
                    message: "Failed to upload image. Please try again later.",
                });
                return 
            }
        }

        const data = {
            courseId:id,
            userId,
            postedBy,
            title, 
            desc, 
            vidUrl,
            imgUrl,
            createdAt: new Date(),
        };

        await col.insertOne(data);
        res.status(201).json({
            "Messages" : "Success posting course",
            data : {
                courseId:id,
                userId,
                postedBy,
                title, 
                desc, 
                vidUrl,
                imgUrl
            }
        });
    } catch(e){
        console.error(e)
    }
}

export const getCourse = async (req: Request, res: Response) => {
    try{
        const { courseId } = req.params;
        if(!courseId){
            res.status(400).json({ message: "Course ID is required." });
            return
        }
        const {database} = await connectDb();
        const col = database.collection(collectionName);
        const data = await col.findOne({courseId})

        if(!data) {
            res.status(404).json({ message: "Course not found." });
            return
        }
        res.status(201).json({
            Message : "Success getting course",
            data
        })
        return
    } catch(e){
        console.error(e)
    }
}

export const getAllCourse = async (req: Request, res: Response) => {
    try{
        const { database } = await connectDb();
        const col = database.collection(collectionName)
        const data = await col.find().toArray()
        res.status(200).json({
            message: 'get all Courses success',
            data
            })
    } catch (e){
        console.error("Failed to get all Courses:", e); 
        res.status(500).json({
            message: 'Failed to get all Courses',
            error: e, 
        });
    }
}

export const editeCourse = async (req: Request, res: Response) => {
    try{
        const {courseId, title, desc, vidUrl, imgUrl } = req.body;
        if( !courseId ){
            res.status(400).json({ message: "All fields are required." });
            return
            }
            const {database} = await connectDb();
            const col = database.collection(collectionName);
            const updateFields: Record<string, any> = {};
            if (title) updateFields.title = title;
            if (desc) updateFields.description = desc;
            if (vidUrl) updateFields.vidUrl = vidUrl;
            const result = await col.updateOne(
                {courseId},
                {$set: updateFields}
            )

            if (result.matchedCount === 0) {
                res.status(404).json({ message: "course not found" });
                return
            }
    
            res.status(200).json({
                message: "course updated successfully",
                updatedFields: updateFields,
            });
    
        }catch (e){
            console.error(e)
        }
}

export const delCourse = async (req: Request,  res: Response) => {
    try{
        const {courseId} = req.params;
        const { database } = await connectDb();
        const col = database.collection(collectionName);
        const data = await col.findOne({ courseId });
        if(!data){
            res.status(404).json({ message: "Forum not found" });
            return
        }

        if (data.imgUrl) {
            const imgParts = data.imgUrl.split("/");
            const imgName = imgParts.pop();
            const imgId = imgName.split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        const response = await col.deleteOne({ courseId });
        res.status(200).json({ 
            message: "Post deleted successfully" ,
            response
        });
    } catch (e){
        console.error("Failed to delete forum", e);
    }
}