import {commentsCollectionDb, usersCollectionDb} from "./db"
import {ObjectId} from "mongodb";
import {CommentatorInfo, CommentsInDbType} from "../models/comments-types";
import {userService} from "../service/user-service";

export const commentsRepository={
    async createComment(content:string,userId:string):Promise<CommentsInDbType|null>{
        const user = await userService.findUsersById(new ObjectId((userId)))
        if(!user){return null;}
        const newComment:CommentsInDbType = {
            id:new ObjectId().toString(),
            content:content,
            commentatorInfo:{userId:userId,userLogin:user.login},
            createdAt:new Date().toISOString()
        }
        await commentsCollectionDb.insertOne(newComment)
        return newComment;
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
