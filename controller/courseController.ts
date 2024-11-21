import { Request, Response } from "express";
import { v4 } from "uuid";
import connectDb from "../database/connect";

const collectionName = 'course';

export const postCourse = async (req: Request, res: Response) => {
    try{
        const { title, description, vidUrl } = req.body;
        const {database} = await connectDb();
        const col = database.collection(collectionName);

        if(!title || !description || !vidUrl){
            res.status(400).json({ message: "All fields are required." });
            return;
        }
        const id = v4();
        const data = {
            courseId:id,
            title, 
            description, 
            vidUrl 
        };

        await col.insertOne(data);
        res.status(201).json({
            "Messages" : "Success posting course",
            data
        });
    } catch(e){
        console.error(e)
    }
}

export const getCourse = async (req: Request, res: Response) => {
    try{
        const { courseId } = req.params;
        if(!courseId){
            res.status(400).json({ message: "User ID is required." });
            return
        }
        const {database} = await connectDb();
        const col = database.collection(collectionName);
        const course = await col.findOne({courseId})

        if(!course) {
            res.status(404).json({ message: "Course not found." });
            return
        }
        res.status(201).json({
            Message : "Success getting course",
            course: {
                courseId: course.courseId,
                title: course.title,
                description: course.description,
                vidUrl: course.vidUrl
            }
        })
        return
    } catch(e){
        console.error(e)
    }
}

export const putCourse = async (req: Request, res: Response) => {
    try{
        const {courseId, title, description, vidUrl } = req.body;
        if( !courseId ){
            res.status(400).json({ message: "All fields are required." });
            return
            }
            const {database} = await connectDb();
            const col = database.collection(collectionName);
            const updateFields: Record<string, any> = {};
            if (title) updateFields.title = title;
            if (description) updateFields.description = description;
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