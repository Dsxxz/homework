import {ObjectId} from "mongodb";
import mongoose from "mongoose";

export type CommentsViewType ={
    id:string,
    content:string,
    commentatorInfo:CommentatorInfo
    createdAt:string,
    likesInfo: {
        "likesCount": number,
        "dislikesCount": number,
        "myStatus": string
    }
}
export type CommentsInDbType={
    _id:ObjectId,
    content:string,
    commentatorInfo:CommentatorInfo
    createdAt:string
    postId:string,
    likesInfo: {
        "likesCount": number,
        "dislikesCount": number,
        "myStatus": string
    }
}
export  type  CommentatorInfo={
    userId:string
    userLogin:string
}
