import {MongoClient} from "mongodb";
import * as dotenv from 'dotenv'
import {UserAccountDbType} from "../models/userType";
import {PostDBType} from "../models/posts-types";
import {BlogDbType} from "../models/blogs-types";
import {CommentsInDbType} from "../models/comments-types";
import {DeviceType, IPCheckerType} from "../models/devices_types";
dotenv.config()

const mongoUri = process.env.MONGO_URL;
if(!mongoUri){
    throw new Error("URL doesnt found")
}
export const client = new MongoClient(mongoUri)

const dbPosts = client.db("postsCollection")
export const postsCollectionDb = dbPosts.collection<PostDBType>("posts");

const dbBlogs = client.db("blogsCollection")
export const blogsCollectionDb = dbBlogs.collection<BlogDbType>("blogs")

const dbUsers = client.db("usersCollection")
export const usersCollectionDb = dbUsers.collection<UserAccountDbType>("users")

const dbComments = client.db("commentsCollection")
export const commentsCollectionDb = dbComments.collection<CommentsInDbType>("comments")

const dbDevices = client.db("devisesCollection")
export const deviceTypeCollection = dbDevices.collection<DeviceType>("devices")

const dbIPRestrict = client.db("IPRestrictCollection")
export const IPRestrictCollectionDb = dbIPRestrict.collection<IPCheckerType>("IPRestrict")

export async function runDb():Promise<void>{
    try{
        await client.connect();
        await client.db("posts").command({ping: 1});
        await client.db("devices").command({ping: 1});
        await client.db("blogs").command({ping: 1});
        await client.db("users").command({ping: 1});
        await client.db("comments").command({ping: 1});
        await client.db("tokens").command({ping: 1});
        await client.db("IPRestrict").command({ping: 1});
        console.log("mongodb connected")
        return;
    }
    catch {
        await client.close();
        return;
    }
}
