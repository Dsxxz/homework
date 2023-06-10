import {ObjectId} from "mongodb";


export type likesInfoType ={
    commentId: ObjectId,
    likesCount:Array<ObjectId>,
    dislikesCount:Array<ObjectId>,
    myStatus:likeEnum
}
export enum likeEnum{
    None="None",
    Like="Like",
    Dislike="Dislike"
}
