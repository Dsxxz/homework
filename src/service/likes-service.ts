import {ObjectId} from "mongodb";
import {userRepository} from "../repositories/user_in_db_repository";
import {UserAccountDbType} from "../models/userType";
import {HydratedDocument} from "mongoose";
import {CommentModel} from "../repositories/db";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {CommentsInDbType} from "../models/comments-types";

export const LikeService={

    async updateCommentLike(userId: ObjectId, likeStatus: string, commentId: ObjectId) {
        const currentUser: HydratedDocument<UserAccountDbType> | null = await userRepository.findUserById(userId)
        if (!currentUser) {
            console.log('LikeService-updateCommentLike-!currentUser')
            throw new Error('User is not exist')
        }
        const oldStatus  = currentUser.likedComments && currentUser.likedComments.find(l => l.commentsId === commentId).status ?
            currentUser.likedComments.find(l => l.commentsId === commentId).status : "None";

        try{
            if(!currentUser.likedComments) {
                currentUser.likedComments = []
                currentUser.likedComments.push({commentsId: commentId, status: likeStatus, createdAt: new Date()})
                console.log("currentUser.likedComments", currentUser.likedComments)
            }

            currentUser.likedComments = currentUser.likedComments.map((like =>{
                if (like.commentsId===commentId){
                    return{
                        ...like,
                        status:likeStatus
                    }
                }
                return like;
            }))
            await commentsRepository.calculateLikesCount(likeStatus, oldStatus, commentId)
            await  userRepository.saveUser(currentUser)
            return;
        }
        catch (e) {
            console.log("LikeService.updateCommentLike", e)
            return;
        }
    },
    async getLikeStatus(commentId: ObjectId,userId?: ObjectId): Promise<string>{
        if(!userId){return "None"}
        const currentUser:HydratedDocument<UserAccountDbType>|null = await userRepository.findUserById(userId)
        if(!currentUser){
            return "None"
        }
        const currentUserLike = currentUser.likedComments?.find(l=>l.commentsId===commentId)
        if(!currentUserLike){
            return "None"
        }
        return currentUserLike.status
},
    async getLikesCounter(commentId:ObjectId){
        const comment:CommentsInDbType|null = await CommentModel.findOne({_id:commentId})
        if(!comment){throw new Error("Comment doesnt exist, method getLikesCounter")}
        return {likes:comment.likesInfo.likesCount, dislikes:comment.likesInfo.dislikesCount}
    }
}