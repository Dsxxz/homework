import {ObjectId} from "mongodb";
import {userRepository} from "../repositories/user_in_db_repository";
import {UserAccountDbType} from "../models/userType";
import {HydratedDocument} from "mongoose";
import {CommentModel} from "../repositories/db";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {CommentsInDbType} from "../models/comments-types";
import {LikedCommentsType} from "../models/LikesInfoType";

export const LikeService={
    async updateCommentLike(userId: ObjectId, likeStatus: string, commentId: ObjectId) {
        const currentUser: HydratedDocument<UserAccountDbType> | null = await userRepository.findUserById(userId)
        if (!currentUser) {
            console.log('LikeService-updateCommentLike-!currentUser')
            throw new Error('User is not exist')
        }
        let oldStatus:string
        const currentUserLike = currentUser.likedComments
        if (!currentUserLike){
            oldStatus="None"
        }
        if (currentUserLike){
            const oldSt:string|undefined=currentUser.likedComments.find(l=>l.commentsId===commentId).status
            if(!oldSt){
                oldStatus="None"}
            if (oldSt){
                oldStatus=oldSt
            }
        }
        try{
            await commentsRepository.calculateLikesCount(oldStatus, likeStatus, commentId)
            await userRepository.updateCommentUser(userId, likeStatus, commentId)
            await  userRepository.saveUser(currentUser)
            return;
        }
        catch (e){
            console.log("LikeService.updateCommentLike", e)
            return;
        }
    },
    async getLikeStatus(userId?: ObjectId|null):Promise<LikedCommentsType[]>{
        if(!userId)
        {
            return [];
        }
        const currentUser:HydratedDocument<UserAccountDbType>|null = await userRepository.findUserById(userId)
        if(!currentUser)
        {
            return []
        }
        return  currentUser.likedComments
        }
,
    async getLikesCounter(commentId:ObjectId){
        const comment:CommentsInDbType|null = await CommentModel.findOne({_id:commentId})
        if(!comment){throw new Error("Comment doesnt exist, method getLikesCounter")}
        return {likes:comment.likesInfo.likesCount, dislikes:comment.likesInfo.dislikesCount}
    }
}