import {commentsCollectionDb} from "./db"
import {ObjectId} from "mongodb";
import {CommentsInDbType, CommentsViewType} from "../models/comments-types";
import {userService} from "../service/user-service";

export const commentsRepository={
    async createComment(content:string,userId:ObjectId, postId:string):Promise<CommentsViewType|null>{
        const user = await userService.findUsersById(userId)
        if(!user){return null;}
        const newComment:CommentsInDbType = {
            id:new ObjectId().toString(),
            content:content,
            commentatorInfo:{userId:user._id.toString(),userLogin:user.login},
            createdAt:new Date().toISOString(),
            postId:postId
        }
        await commentsCollectionDb.insertOne(newComment)
        return {
            id:newComment.id,
            content:newComment.content,
            commentatorInfo:newComment.commentatorInfo,
            createdAt:newComment.createdAt
                }
    },
    async getCommentById(id:string):Promise<CommentsViewType|null>{
        const findComment:CommentsInDbType|null = await commentsCollectionDb.findOne({id: id})
        if(!findComment){return null;}
        return {
            id:findComment.id,
            content:findComment.content,
            commentatorInfo:findComment.commentatorInfo,
            createdAt:findComment.createdAt
        }
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