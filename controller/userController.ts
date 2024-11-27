import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import jwToken from "../utils/jwToken";
import bcrypt from "bcryptjs";
import connectDb from "../database/connect";

const collectionName = 'user';

export const postUser = async (req: Request, res: Response) => {
    try{
        const { name, username, email, password } = req.body;
        if (!username || !password || !name || !email) {
            res.status(400).json({ message: "data are required." });
            return;
        }
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10)
        const {database} = await connectDb();
        const col = database.collection(collectionName)

        const existingUser = await col.findOne({ username });
        if (existingUser) {
            res.status(400).json({ message: "Username already exists." });
            return;
        }

        const data = {
            userId: id,
            name,
            username, 
            password: hashedPassword,
            email
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

export const getUserByUsername = async (req: Request, res: Response) => {
    try{
        const { username, password } = req.body;
        const {database} = await connectDb();
        const col = database.collection(collectionName);
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
            user: {
                userId: data.userId,
                username : data.username,
            }
        })
    } catch (e){
        console.log("Failed to get username user");
    }

}

export const getUserById = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if(!userId){
        res.status(400).json({ message: "User ID is required." });
        return
    }

    const { database } = await connectDb();
    const col = database.collection(collectionName);

    const user = await col.findOne({ userId });
    if (!user) {
        res.status(404).json({ message: "User not found." });
        return
    }

    res.status(200).json({
        message: "User retrieved successfully.",
        user: {
            userId: user.userId,
            name: user.name,
            username: user.username,
            email: user.email,
        },
    });
    return 
}

export const changeUser = async (req: Request, res: Response) => {
    try {
        const { userId ,username, name, password, userPP, email } = req.body;

        if (!userId) {
            res.status(400).json({ message: "userId is required for update" });
            return;
        }

        const {database} = await connectDb();
        const col = database.collection(collectionName);

        const updateFields: Record<string, any> = {};
        if (username) updateFields.username = username;
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (userPP) updateFields.profilePic = userPP;
        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        const result = await col.updateOne(
            { userId },
            { $set: updateFields } 
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ message: "User not found" });
            return
        }

        res.status(200).json({
            message: "User updated successfully",
            updatedFields: updateFields,
        });
    } catch (e) {
        console.error("Failed to update user:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}