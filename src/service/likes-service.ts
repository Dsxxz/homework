import {ObjectId} from "mongodb";
import {likesRepo} from "../repositories/likes-in_repo";
import {LikedType} from "../models/LikesInfoType";

class LikesService{
    async createOrUpdateLike(commentIdOrPost:ObjectId, userId:ObjectId, field:string, status: string){
        return await likesRepo.createOrUpdateLike(commentIdOrPost, userId, field, status)
        }
    async findLikes(commentOrPostId:ObjectId):Promise<LikedType[]|null>{
        return await likesRepo.findLike(commentOrPostId)
    }
    async deleteLike(_id: ObjectId) {
        return await likesRepo.deleteLike(_id)
    }
    async deleteLikes(commentOrPostId: ObjectId) {
        return await likesRepo.deleteLikes(commentOrPostId);
    }
    async findLatestLikes(postId:ObjectId):Promise<any[]>{
        return likesRepo.findLatestLikes(postId)
    }
}
export const likesService=new LikesService()