import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import jwToken from "../utils/jwToken";
import bcrypt from "bcryptjs";
import connectDb from "../database/connect";

const collectionName = 'user'

export const postUser = async (req: Request, res: Response) => {
    try{
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: "Username and password are required." });
            return;
        }
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10)
        const {client, database} = await connectDb();
        const col = database.collection(collectionName)

        const userData = {
            userId: id,
            username, 
            password: hashedPassword
        }

        const result = await col.insertOne(userData);
        const token = jwToken(userData.userId);

        res.status(201).json({
            "Messages" : "Success posting user",
            token,
            data: result
        });
    } catch (e){
        console.log("Failed to post user");
    }
}

export const getUserByUsername = async (req: Request, res: Response) => {
    try{
        const { username, password } = req.body;
        const {client, database} = await connectDb();
        const col = database.collection(collectionName);

        const user = await col.findOne({ username });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }
        const token = jwToken(user.userId);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                userId: user.userId,
                username : user.username,
            }
        })
    } catch (e){
        console.log("Failed to get username user");
    }

}