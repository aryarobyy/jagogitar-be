import * as dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';

dotenv.config();

const uri: string = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName: string = process.env.MONGODB || "test";

if (!uri) throw new Error("Environment variable MONGO_URI tidak ditemukan");
if (!dbName) throw new Error("Environment variable MONGODB tidak ditemukan");

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const connectDb = async () => {
    try {
        if (cachedClient && cachedDb) {
            console.log("Using cached MongoDB connection.");
            return { client: cachedClient, database: cachedDb };
        }

        const client = new MongoClient(uri, {
            connectTimeoutMS: 10000,  
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true
        });

        console.log("Attempting to connect to MongoDB...");
        console.log("URI: ", uri.replace(/:(.*?)@/, ':****@'));
        console.log("Database: ", dbName);
        await client.connect();

        const database = client.db(dbName);

        // Test connection
        await database.command({ ping: 1 });
        console.log("MongoDB ping successful.");

        cachedClient = client;
        cachedDb = database;

        console.log("Successfully connected to MongoDB.");
        return { client, database };

    } catch (error) {
        console.error("Failed to connect to MongoDB. Check the following:");
        console.error("- Is the database URI correct?");
        console.error("- Is the database name correct?");
        console.error("- Are IP whitelists properly configured?");
        console.error("Error details:", error);

        throw new Error(`Failed to connect to MongoDB: ${error}`);
    }
};

export const getClient = () => cachedClient;
export const getDb = () => cachedDb;

export default connectDb;
