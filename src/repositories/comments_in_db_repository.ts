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
                myStatus:newComment.likesInfo.myStatus,
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
    async getLikeStatus(commentId:ObjectId,userId:ObjectId|null):Promise<likeEnum>{
        const userLiked = await CommentModel.findOne({_id: commentId,"likesInfo.likesCount":{ "$in" : userId } })
        if (userLiked) return likeEnum.Like;
        const userDisliked  = await CommentModel.findOne({_id: commentId,"likesInfo.dislikesCount":{ "$in" : userId } })
        if (userDisliked) return likeEnum.Dislike;
        else return likeEnum.None;

    },
    async setLike(commentId:string, status:string,userId:ObjectId) {
        const findComment = await this.getCommentById(commentId)
        if(findComment) {
            const index = findComment.likesInfo.dislikesCount.indexOf(userId)
            if (index > -1) {
                findComment.likesInfo.dislikesCount.splice(index, 1);
            }
            findComment.likesInfo.likesCount.push(userId)
            return;
        }
        return;
    },
    async setDislike(commentId:string, status:string,userId:ObjectId) {
        const findComment = await this.getCommentById(commentId)
        if(findComment) {
            const index = findComment.likesInfo.likesCount.indexOf(userId)
            if (index > -1) {
                findComment.likesInfo.likesCount.splice(index, 1);
            }
            findComment.likesInfo.dislikesCount.push(userId);
            return;
        }
        return;
    }
}
