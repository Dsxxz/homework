import {commentsCollectionDb} from "./db"
import {ObjectId} from "mongodb";
import {CommentsInDbType, CommentsViewType} from "../models/comments-types";
import {userService} from "../service/user-service";

export const commentsRepository={
    async createComment(content:string,userId:ObjectId, postId:string):Promise<CommentsViewType|null>{
        const user = await userService.findUsersById(userId)
        if(!user) return null
        const newComment:CommentsInDbType = {
            _id:new ObjectId(),
            content:content,
            commentatorInfo:{userId:user._id.toString(),userLogin:user.login},
            createdAt:new Date().toISOString(),
            postId:postId
        }
        await commentsCollectionDb.insertOne(newComment)
        return {
            commentatorInfo:newComment.commentatorInfo,
            content:newComment.content,
            createdAt:newComment.createdAt,
            id:newComment._id.toString()
        }
    },
    async getCommentById(id:string):Promise<CommentsViewType|null>{
        const findComment:CommentsInDbType|null = await commentsCollectionDb.findOne({_id: new ObjectId(id) })
        if(!findComment){return null;}
        return {
            id:findComment._id.toString(),
            content:findComment.content,
            commentatorInfo:findComment.commentatorInfo,
            createdAt:findComment.createdAt
        }
    },
    async getAllCommentsForSpecificPost(postId:string):Promise<Array<CommentsViewType>>{
        const findComments:Array<CommentsInDbType> = await commentsCollectionDb.find({postId: postId}).toArray()
        return findComments.map((comment: CommentsInDbType) => ({
            id:comment._id.toString(),
            content:comment.content,
            commentatorInfo:comment.commentatorInfo,
            createdAt:comment.createdAt
        }))},
    async updateComment(id:string,content:string):Promise<boolean>{
        const resultBlog= await commentsCollectionDb.updateOne({_id: new ObjectId(id)},{$set: {content}})
        return resultBlog.matchedCount===1 ;
    },
    async deleteComment(id:string): Promise<boolean>{
        const result = await commentsCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    }
}
