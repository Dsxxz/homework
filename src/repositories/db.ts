import {MongoClient} from "mongodb";
import * as dotenv from 'dotenv'
import {UserInDbType} from "../models/userType";
import {PostDBType} from "../models/posts-types";
import {BlogDbType} from "../models/blogs-types";
import {CommentsInDbType} from "../models/comments-types";
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
export const usersCollectionDb = dbUsers.collection<UserInDbType>("users")

const dbComments = client.db("commentsCollection")
export const commentsCollectionDb = dbComments.collection<CommentsInDbType>("comments")


export async function runDb(){
    try{
        await client.connect();
        await client.db("posts").command({ping: 1});
        await client.db("blogs").command({ping: 1});
        await client.db("users").command({ping: 1});
        await client.db("comments").command({ping: 1});
        console.log("mongod connected")
    }
    catch {
        await client.close();
    }
}
export const JWT_SECRET = process.env.JWT_SECRET || '123'