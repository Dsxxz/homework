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
            _id:newComment._id.toString(),
            commentatorInfo:newComment.commentatorInfo,
            content:newComment.content,
            createdAt:newComment.createdAt,
        }
    },
    async getCommentById(id:string):Promise<CommentsInDbType|null>{
        const findComment:CommentsInDbType|null = await commentsCollectionDb.findOne({_id: new ObjectId(id) })
        if(!findComment){return null;}
        return findComment
    },
    async updateComment(id:string,content:string):Promise<boolean>{
        const resultBlog= await commentsCollectionDb.updateOne({_id: new ObjectId(id)},{$set: {content}})
        return resultBlog.matchedCount===1 ;
    },
    async deleteComment(id:string): Promise<boolean>{
        const result = await commentsCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    }
}
