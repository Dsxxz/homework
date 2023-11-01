import {ObjectId} from "mongodb";

export enum likeEnum{
    None="None",
    Like="Like",
    Dislike="Dislike"
}
export type LikedCommentsType =
    {
        commentsId:ObjectId,
        status: string,
        createdAt: Date
    }
