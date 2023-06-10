import {ObjectId} from "mongodb";
import {likeEnum} from "./LikesInfoType";

export type CommentsViewType ={
    id:string,
    content:string,
    commentatorInfo:CommentatorInfo
    createdAt:string,
    likesInfo: {
        "likesCount": number,
        "dislikesCount": number,
        "myStatus": likeEnum
    }
}
export type CommentsInDbType={
    _id:ObjectId,
    content:string,
    commentatorInfo:CommentatorInfo
    createdAt:string
    postId:string,
    likesInfo: {
        "likesCount": [],
        "dislikesCount": [],
        "myStatus": string
    }
}
export  type  CommentatorInfo={
    userId:string
    userLogin:string
}
