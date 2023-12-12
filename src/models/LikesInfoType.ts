import {ObjectId} from "mongodb";

export enum likeEnum{
    None="None",
    Like="Like",
    Dislike="Dislike"
}
export type LikedCommentsType =
    {
        _id:ObjectId,
        status: string,
        createdAt: string,
        userId: ObjectId,
        field:string
    }
