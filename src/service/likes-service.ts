import {ObjectId} from "mongodb";
import {LikesRepo} from "../repositories/likes-in_repo";
import {LikedCommentsType} from "../models/LikesInfoType";

export const likesService={
    async createOrUpdateLike(commentId:ObjectId, userId:ObjectId, field:string, status: string){
        return await LikesRepo.createOrUpdateLike(commentId, userId, field, status)
        },
    async findCommentLikes(commentId:ObjectId):Promise<LikedCommentsType[]|null>{
        return await LikesRepo.findCommentLikes(commentId)
    },
    async deleteLike(_id: ObjectId) {
        return await LikesRepo.deleteLike(_id)
    }
}