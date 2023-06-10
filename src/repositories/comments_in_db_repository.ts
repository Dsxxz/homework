import {CommentModel} from "./db"
import {ObjectId} from "mongodb";
import {CommentsInDbType, CommentsViewType} from "../models/comments-types";
import {authService} from "../service/auth-service";
import {likeEnum} from "../models/LikesInfoType";

export const commentsRepository={
    async createComment(content:string,userId:ObjectId, postId:string):Promise<CommentsViewType|null>{
        const user = await authService.findUsersById(userId)
        if(!user) return null
        const newComment:CommentsInDbType = {
            _id:new ObjectId(),
            content:content,
            commentatorInfo:{userId:user._id.toString(),userLogin:user.accountData.userName},
            createdAt:new Date().toISOString(),
            postId:postId,
            likesInfo: {
                likesCount: [],
                dislikesCount: [],
                myStatus: likeEnum.None
            }
        }
        await CommentModel.create(newComment)
        return {
            id:newComment._id.toString(),
            commentatorInfo:newComment.commentatorInfo,
            content:newComment.content,
            createdAt:newComment.createdAt,
            likesInfo: {
                likesCount:newComment.likesInfo.likesCount.length,
                dislikesCount:newComment.likesInfo.dislikesCount.length,
                myStatus:likeEnum.None,
            }
        }
    },
    async getCommentById(id:string):Promise<CommentsInDbType|null>{
        const findComment:CommentsInDbType|null = await CommentModel.findOne({_id: new ObjectId(id) })
        if(!findComment){return null;}
        return findComment
    },
    async updateComment(id:string,content:string):Promise<boolean>{
        const resultBlog= await CommentModel.updateOne({_id: new ObjectId(id)},{$set: {content}})
        return resultBlog.matchedCount===1 ;
    },
    async deleteComment(id:string): Promise<boolean>{
        const result = await CommentModel.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    },
    async setLike(id:ObjectId, status:string, userId:ObjectId){
         await CommentModel.updateOne({_id: new ObjectId(id)},{$set: {myStatus:status}})
         await CommentModel.updateOne({_id: new ObjectId(id)},{$pull: {"likesInfo.likesCount":userId,
                 "likesInfo.dislikesCount":userId}})
        if(status===likeEnum.Like){
            return CommentModel.updateOne({_id: new ObjectId(id)},{$push:{"likesInfo.likesCount":userId}})
        }
        if(status===likeEnum.Dislike){
            return CommentModel.updateOne({_id: new ObjectId(id)},{$push:{"likesInfo.dislikesCount":userId}})
        }
        if(status===likeEnum.None){
            return CommentModel.updateOne({_id: new ObjectId(id)},{$push:{"likesInfo.likesCount":userId}})
        }
    }
}
