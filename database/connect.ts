import * as dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';

dotenv.config();

const uri: string | undefined = process.env.MONGO_URI;
const dbName: string | undefined = process.env.MONGODB;

if (!uri) throw new Error("Environment variable MONGO_URI tidak ditemukan");
if (!dbName) throw new Error("Environment variable MONGODB tidak ditemukan");

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const connectDb = async () => {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, database: cachedDb };
    }

    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db(dbName);

    cachedClient = client;
    cachedDb = database;

    return { client, database };
};

export default connectDb;
