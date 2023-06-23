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
        if(!ObjectId.isValid(id)) {
            return null
        }
        const findComment = await CommentModel.findOne({_id: new ObjectId(id) }).lean()
        if(!findComment){return null;}
        return {
            _id:findComment._id,
            commentatorInfo:findComment.commentatorInfo,
            content:findComment.content,
            createdAt:findComment.createdAt,
            postId:findComment.postId,
            likesInfo: {
                likesCount:findComment.likesInfo.likesCount,
                dislikesCount:findComment.likesInfo.dislikesCount,
                myStatus:findComment.likesInfo.myStatus,
            }
        };
    },
    async updateComment(id:string,content:string):Promise<boolean>{
        const resultBlog= await CommentModel.updateOne({_id: new ObjectId(id)},{$set: {content}})
        return resultBlog.matchedCount===1 ;
    },
    async deleteComment(id:string): Promise<boolean>{
        const result = await CommentModel.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    },
    async getLikeStatus(commentId:string,userId?:ObjectId|null):Promise<string>{
        if(!userId) {
            return "None";
        }
        const userLiked = await CommentModel.findOne({_id: new ObjectId(commentId),"likesInfo.likesCount":{ "$in" : userId } })
        if (userLiked) {
            return "Like";
        }
        const userDisliked  = await CommentModel.findOne({_id: new ObjectId(commentId),"likesInfo.dislikesCount":{ "$in" : userId } })
        if (userDisliked) {
            return "Dislike";
        }
        else {
            return "None";
        }
    },
    async setLike(commentId:string,userId:ObjectId) {
        const findComment = await CommentModel.findOne({_id: new ObjectId(commentId)})
        if(findComment) {
            const indexDislike = findComment.likesInfo.dislikesCount.indexOf(userId)
            const indexLike = findComment.likesInfo.likesCount.indexOf(userId)
            if (indexDislike > -1) {
                findComment.likesInfo.dislikesCount.splice(indexDislike, 1);
            }
            if (indexLike > -1) {
                findComment.likesInfo.likesCount.splice(indexLike, 1);
            }
            findComment.likesInfo.likesCount.push(userId)
            await findComment.save()
        }
        return;
    },
    async setDislike(commentId:string,userId:ObjectId) {
        const findComment = await CommentModel.findOne({_id: new ObjectId(commentId)})
        if(findComment) {
            const indexDislike = findComment.likesInfo.dislikesCount.indexOf(userId)
            const indexLike = findComment.likesInfo.likesCount.indexOf(userId)
            if (indexDislike > -1) {
                findComment.likesInfo.dislikesCount.splice(indexDislike, 1);
            }
            if (indexLike > -1) {
                findComment.likesInfo.likesCount.splice(indexLike, 1);
            }
            findComment.likesInfo.dislikesCount.push(userId)
            await findComment.save()
        }
        return;
    }
}
