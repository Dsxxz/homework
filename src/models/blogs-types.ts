import {ObjectId} from "mongodb";


export type BlogType ={
    createdAt:string,
    id: string,
    name:string,
    websiteUrl:string,
    description:string,
    isMembership:boolean
}

export type BlogDbType = {
    createdAt: string,
    name: string,
    websiteUrl: string,
    _id:  ObjectId,
    description: string,
    isMembership:boolean
}