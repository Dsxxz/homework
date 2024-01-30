import {ObjectId} from "mongodb";

export enum likeEnum{
    None="None",
    Like="Like",
    Dislike="Dislike"
}
export type LikedType =
    {
        _id:ObjectId,
        commentOrPostId:ObjectId,
        status: string,
        createdAt: string,
        userId: ObjectId,
        field:string
    }
