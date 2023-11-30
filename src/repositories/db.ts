import {MongoClient} from "mongodb";
import * as dotenv from 'dotenv'
import {UserAccountDbType} from "../models/userType";
import {PostDBType} from "../models/posts-types";
import {BlogDbType} from "../models/blogs-types";
import {CommentsInDbType} from "../models/comments-types";
import {DeviceType, IPCheckerType} from "../models/devices_types";
import mongoose from "mongoose";
dotenv.config()

const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/homework';
if(!mongoUri){
    throw new Error("URL doesnt found")
}


const userSchema = new mongoose.Schema<UserAccountDbType>({
    _id: {type:mongoose.Schema.ObjectId, required:true},
    accountData: {
        userName: {type:String, required:true},
        email:{type:String, required:true},
        userPasswordHash: {type:String, required:true},
        userPasswordSalt: {type:String, required:true},
        createdAt: {type:String, required:true}},
    emailConfirmation: {
        confirmationCode:  {type:String, required:true},
        expirationDate: {type:Date, required:true},
        isConfirmed: {type:Boolean, required:true}
    },
    likedComments: [ { type: mongoose.Schema.ObjectId,
        status: String,
        createdAt: Date}]
})

const blogSchema = new mongoose.Schema<BlogDbType>({
    createdAt:  {type:String, required:true},
    name:  {type:String, required:true},
    websiteUrl:  {type:String, required:true},
    _id:   {type:mongoose.Schema.ObjectId, required:true},
    description:  {type:String, required:true},
    isMembership: {type:Boolean, required:true}})
const postSchema = new mongoose.Schema<PostDBType>({
    _id: {type:mongoose.Schema.ObjectId, required:true},
    blogId:  {type:String, required:true},
    blogName:  {type:String, required:true},
    content:  {type:String, required:true},
    createdAt: {type:String, required:true},
    shortDescription:  {type:String, required:true},
    title:  {type:String, required:true}
})
const commentSchema = new mongoose.Schema<CommentsInDbType>({
    _id: {type:mongoose.Schema.ObjectId, required:true},
    content: {type:String, required:true},
    commentatorInfo:{
        userId: {type:String, required:true},
        userLogin: {type:String, required:true}
    },
    createdAt: {type:String, required:true},
    postId: {type:String, required:true},
    likesInfo:{
        likesCount: {type:Number, required:true},
        dislikesCount:{type:Number, required:true},
        myStatus: {type:String}
    }
})
const devicesSchema = new mongoose.Schema<DeviceType>({
    ip:	 {type:String, required:true},  //IP address of device during signing in
    title:	 {type:String, required:true},   //Device name: for example Chrome 105 (received by parsing http header "user-agent")
    lastActiveDate: {type:String, required:true},   //Date of the last generating of refresh/access tokens
    deviceId: {type:mongoose.Schema.ObjectId, required:true},  // ID of connected device session
    userId: {type:mongoose.Schema.ObjectId, required:true}
})
const restrictsSchema = new mongoose.Schema<IPCheckerType>({
    ip: {type:String, required:true},
    url: {type:String, required:true},
    date: {type:Date, required:true}
})


export const UserModelClass =  mongoose.model('users', userSchema);
export const BlogModel =  mongoose.model('blogs', blogSchema);
export const PostModel =  mongoose.model('posts', postSchema);
export const CommentModel =  mongoose.model('comments', commentSchema);
export const DeviceModel =  mongoose.model('devices', devicesSchema);
export const RestrictModel =  mongoose.model('restricts', restrictsSchema);



export const client = new MongoClient(mongoUri)



export async function runDb():Promise<void>{
    try{
        await client.connect();
        await mongoose.connect(mongoUri, {dbName: "homework"})
        console.log("mongoose connected")
        return;
    }
    catch {
        await mongoose.disconnect()
        return;
    }
}
