import {ObjectId} from "mongodb";

export type PostDBType={
    _id:ObjectId,
    blogId: string,
    blogName: string,
    content: string,
    createdAt:string,
    shortDescription: string,
    title: string
}
export type PostType = {
    id:string,
    blogId: string,
    blogName: string,
    content: string,
    createdAt:string,
    shortDescription: string,
    title: string
}
