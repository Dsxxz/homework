import {CommentModel} from "./db"
import {ObjectId} from "mongodb";
import {CommentsInDbType, CommentsViewType} from "../models/comments-types";
import {authService} from "../service/auth-service";
import {likeEnum} from "../models/LikesInfoType";
import {HydratedDocument} from "mongoose";

export const commentsRepository={
    async saveComment(comment:HydratedDocument<CommentsInDbType>){
        return await comment.save();
    },
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
                likesCount: 0,
                dislikesCount: 0,
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
                likesCount:0,
                dislikesCount:0,
                myStatus:likeEnum.None,
            }
        }
    },
    async getCommentById(id:string):Promise<HydratedDocument<CommentsInDbType>|null>{
        return  CommentModel.findOne({_id: new ObjectId((id))})
    },
    async updateComment(id:string,content:string){
       return  CommentModel.findOneAndUpdate({_id: new ObjectId(id)},{$set: {content}})
    },
    async deleteComment(id:string){
       return CommentModel.findOneAndDelete({_id: new ObjectId(id)})
    }
    ,async calculateLikesCount(oldStatus:string,newStatus: string,commentId: ObjectId){
        const comment:HydratedDocument<CommentsInDbType>|null = await CommentModel.findOne({_id:commentId})
        if(!comment){throw new Error('Comment doesnt exist, method calculateLikesCount')}

         if(oldStatus==='None'){
             if(newStatus==='Like') {
                 comment.likesInfo.likesCount++
                 await this.saveComment(comment)
             }
             if(newStatus==='Dislike') {
                 comment.likesInfo.dislikesCount++
                 await this.saveComment(comment)
             }
         }
         if (oldStatus===newStatus){
             await this.saveComment(comment);
         }
         if (oldStatus!=='None'){
         if(newStatus==='Like'){
             comment.likesInfo.likesCount++
             comment.likesInfo.dislikesCount--
             await  this.saveComment(comment)
         }
         if(newStatus==='Dislike'){
             comment.likesInfo.likesCount--
             comment.likesInfo.dislikesCount++
             await this.saveComment(comment)
         }}
        console.log(comment.likesInfo.likesCount, comment.likesInfo.dislikesCount)
         return;
         }
}
