import { Request, Response } from "express";

export const postUser = async (req: Request, res: Response) => {
    try{
        const { username, password } = req.body;
        const userData = {
            username, 
            password
        }

        res.status(201).json({
            "Messages" : "Success posting user",
            userData
        });

    } catch (e){
        console.log("Error in postUser");
    }
}