import {ObjectId} from "mongodb";
import {LikesInfoModel} from "./db";
import {HydratedDocument} from "mongoose";
import {LikedCommentsType} from "../models/LikesInfoType";

export const LikesRepo={
    async saveLike(like:HydratedDocument<LikedCommentsType>):Promise<HydratedDocument<LikedCommentsType>>{
       return await like.save();
    },
    async createOrUpdateLike(commentId:ObjectId, userId:ObjectId, field:string, status: string):Promise<HydratedDocument<LikedCommentsType>|null>{
        const findLike = await LikesInfoModel.findOne({id:commentId,userId:userId})
        if(!findLike){
            const like = new LikesInfoModel({_id:commentId,
                status: status,
                createdAt: new Date().toISOString(),
                userId: userId,
                field:field})
            await this.saveLike(like)
            return like;
        }
        else{
            return LikesInfoModel.findOneAndUpdate({id:commentId,userId:userId},{ $set:{status:status}})
        }
    },
    async findCommentLikes(commentId:ObjectId):Promise<LikedCommentsType[]|null>{
        return  LikesInfoModel.find({_id:commentId})
    },
    async deleteLike(_id: ObjectId) : Promise<boolean>{
        const likeInstance = await LikesInfoModel.findOne({_id:_id});
        if(!likeInstance)return false;
        await likeInstance.deleteOne();
        return true;    }
}