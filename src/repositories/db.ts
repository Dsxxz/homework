import {MongoClient, ObjectId} from "mongodb";
import * as dotenv from 'dotenv'
dotenv.config()
export type PostType = {
    id:string,
    blogId: string,
    blogName: string,
    content: string,
    createdAt:string,
    shortDescription: string,
    title: string
}

export type PostDBType={
    _id:ObjectId,
    blogId: string,
    blogName: string,
    content: string,
    createdAt:string,
    shortDescription: string,
    title: string
}
export type BlogType ={
    createdAt:string,
    id: string,
    name:string,
    websiteUrl:string,
    description:string
}

export type BlogDbType = {
    createdAt: string,
    name: string,
    websiteUrl: string,
    id:  ObjectId,
    description: string
}


const mongoUri = process.env.MONGO_URL;
if(!mongoUri){
    throw new Error("URL doesnt found")
}
export const client = new MongoClient(mongoUri)
const dbPosts = client.db("postsCollection")
export const postsCollectionDb = dbPosts.collection<PostDBType>("posts")
const dbBlogs = client.db("blogsCollection")
export const blogsCollectionDb = dbBlogs.collection<BlogDbType>("blogs")



export async function runDb(){
    try{
        await client.connect();
        await client.db("posts").command({ping: 1});
        await client.db("blogs").command({ping: 1});
        console.log("mongod connected")
    }
    catch {
        await client.close();
    }
}