import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import jwToken from "../utils/jwToken";
import bcrypt from "bcryptjs";
import connectDb from "../database/connect";
import { v2 as cloudinary } from "cloudinary";

const collectionName = 'user';

export const postUser = async (req: Request, res: Response) => {
    let client;
    try{
        const { name, username, email, password, userPP, status = "userPending", role = "pending" } = req.body;
        if (!username || !password || !name || !email) {
            res.status(400).json({ message: "data are required." });
            return;
        }
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10)
        const { client: mongoClient, database } = await connectDb();
        const col = database.collection(collectionName)
        const existingUser = await col.findOne({ username });
        client = mongoClient;
        if (existingUser) {
            res.status(400).json({ message: "Username already exists." });
            return;
        }
        if (password) {
            if (password.length < 8) {
                res.status(400).json({ message: "Password must be at least 8 characters long" });
                return;
            }
        }

        const data = {
            userId: id,
            name,
            username, 
            password: hashedPassword,
            email,
            status,
            role,
            userPP
        }

        await col.insertOne(data);
        const token = jwToken(data.userId);

        res.status(201).json({
            "Messages" : "Success posting user",
            token,
            data
        });
    } catch (e){
        console.log("Failed to post user");
    }
}

export const loginUser = async (req: Request, res: Response) => {
    let client;
    try{
        const { username, password } = req.body;
        const {client : mongoClient,database} = await connectDb();
        const col = database.collection(collectionName);
        client = mongoClient;
        console.log(req.body)
        const data = await col.findOne({ username });
        if (!data) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        console.log('Stored Password:', data.password);
        console.log('Is Password Valid:', await bcrypt.compare(password, data.password));

        const isPasswordValid = await bcrypt.compare(password, data.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }
        const token = jwToken(data.userId);

        res.status(200).json({
            message: 'Login successful',
            token,
            data
        })
    } catch (e){
        console.log("Failed to get username user");
    }

}

export const getUserById = async (req: Request, res: Response) => {
    let client;
    const { userId } = req.params;
    if(!userId){
        res.status(400).json({ message: "User ID is required." });
        return
    }

    const { client: mongoClient, database } = await connectDb();
    const col = database.collection(collectionName);
    client = mongoClient;
    const data = await col.findOne({ userId });
    if (!data) {
        res.status(404).json({ message: "User not found." });
        return
    }

    res.status(200).json({
        message: "User retrieved successfully.",
        data,
    });
    return 
}

export const changeUser = async (req: Request, res: Response) => {
    let client;
    try {
        const { userId } = req.params
        const { username, name, password, userPP, email , status, role} = req.body;

        if (!userId) {
            res.status(400).json({ message: "userId is required for update" });
            return;
        }

        const { client: mongoClient, database} = await connectDb();
        const col = database.collection(collectionName);
        client = mongoClient;
        const updateFields: Record<string, any> = {};
        if (username) updateFields.username = username;
        if (name) updateFields.name = name;
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({ message: "Invalid email format" });
                return 
            }
            updateFields.email = email;
        }
        if (status) updateFields.status = status;
        if (role) updateFields.role = role;
        if (password) {
            if (password.length < 8) {
                res.status(400).json({ message: "Password must be at least 6 characters long" });
                return;
            }
            updateFields.password = await bcrypt.hash(password, 10);
        }

        if (userPP) {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(userPP, {
                    folder: "jagogitar",
                    resource_type: "image",
                    max_file_size: 5 * 1024 * 1024,
                    allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
                });
                updateFields.userPP = uploadedResponse.secure_url;
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                res.status(500).json({ message: "Failed to upload image" });
                return 
            }
        }
        const result = await col.updateOne(
            { userId },
            { $set: updateFields } 
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ message: "User not found" });
            return
        }

        const data = await col.findOne({ userId });

        res.status(200).json({
            message: "User updated successfully",
            data,
        });
    } catch (e) {
        console.error("Failed to update user:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const  getAllUser = async (req: Request, res: Response) => {
    try{
        const { database } = await connectDb();
        const col = database.collection(collectionName)
        const data = await col.find().toArray()

        res.status(200).json({
            message: "get All users success" ,
            data
        })
    } catch (e) {
        console.error("Failed to get all users:", e); 
        res.status(500).json({
            message: 'Failed to get all users',
            error: e, 
        });
    }
} 

export const delUser = async (req: Request, res: Response) => {
    try{
        const { userId } = req.params;
        const { database } = await connectDb();
        const col = database.collection(collectionName)
        const data = await col.findOne({userId});

        if(!data) {
            res.status(404).json({ message: "User not found" });
            return
        }

        if (data.userPP) {
            const imgParts = data.userPP.split("/");
            const imgName = imgParts.pop();
            const imgId = imgName.split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        const response = await col.deleteOne({ userId });
        res.status(200).json({ 
            message: "User deleted successfully" ,
            response
        });
        return
    } catch (e) {
        console.error("Failed to delete user:", e);
    }
}

export const regisMentor = async (req: Request, res: Response) => {
    let client;
    try {
        const { userId ,portoUrl, reason } = req.body; 

        if (!userId || !portoUrl || !reason) {
            res.status(400).json({ message: "All fields (userId, portoUrl, reason) are required." });
            return;
        }

        const { client: mongoClient, database } = await connectDb();
        const col = database.collection(collectionName);
        client = mongoClient;

        const existingUser = await col.findOne({ userId });
        if (!existingUser) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const data = {
            ...existingUser,
            status: "mentorPending",
            portoUrl, 
            reason, 
        };

        await col.replaceOne({ userId }, data);

        res.status(200).json({
            message: "User updated to mentor successfully.",
            data,
        });
    } catch (e) {
        console.error("Failed to register mentor:", e);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getUserByUsername = async (req: Request, res: Response) => {
    let client;
    const { username } = req.params;
    if(!username){
        res.status(400).json({ message: "User ID is required." });
        return
    }

    const { client: mongoClient, database } = await connectDb();
    const col = database.collection(collectionName);
    client = mongoClient;
    const data = await col.findOne({ username });
    if (!data) {
        res.status(404).json({ message: "User not found." });
        return
    }

    res.status(200).json({
        message: "User retrieved successfully.",
        data,
    });
    return 
}