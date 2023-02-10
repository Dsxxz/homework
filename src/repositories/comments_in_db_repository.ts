import {commentsCollectionDb} from "./db"
import {ObjectId} from "mongodb";
import {CommentatorInfo, CommentsInDbType} from "../models/comments-types";

export const commentsRepository={
    async createComment(content:string,userId:string,userLogin:string){
        const newComment:CommentsInDbType = {
            id:new ObjectId().toString(),
            content:content,
            commentatorInfo:{userId:userId,userLogin:userLogin},
            createdAt:new Date().toISOString()
        }
       return  await commentsCollectionDb.insertOne(newComment)
    },
    async getCommentById(id:string):Promise<CommentsInDbType|null>{
        if(!ObjectId.isValid(id)) {
            return null
        }
        return await commentsCollectionDb.findOne({_id: new ObjectId(id)})
    },
    async updateComment(id:string,content:string):Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const resultBlog= await commentsCollectionDb.updateOne({_id: new ObjectId(id)},{$set: {content}})
        return resultBlog.matchedCount===1 ;
    },
    async deleteComment(id:string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const result = await commentsCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    }
}
