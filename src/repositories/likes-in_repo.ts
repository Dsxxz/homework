import {ObjectId} from "mongodb";
import {LikesInfoModel} from "./db";
import {HydratedDocument} from "mongoose";
import {LikedCommentsType} from "../models/LikesInfoType";

export const LikesRepo={
    async saveLike(like:HydratedDocument<LikedCommentsType>):Promise<HydratedDocument<LikedCommentsType>>{
       return await like.save();
    },
    async createOrUpdateLike(commentId:ObjectId, userId:ObjectId, field:string, status: string):Promise<HydratedDocument<LikedCommentsType>|null|boolean>{
        if(status==="None"){
            return this.deleteLike(commentId)
        }
        const findLike = await LikesInfoModel.findOne({id:commentId,userId:userId})
        if(!findLike){
            const like = new LikesInfoModel({
                _id:new ObjectId(),
                commentId:commentId,
                status: status,
                createdAt: new Date().toISOString(),
                userId: userId,
                field:field})
            await this.saveLike(like)
            return like;
        }
        else{
            return LikesInfoModel.findOneAndUpdate({commentId:commentId,userId:userId},{ $set:{status:status}})
        }
    },
    async findCommentLikes(commentId:ObjectId):Promise<LikedCommentsType[]|null>{
        return  LikesInfoModel.find({commentId:commentId})
    },
    async deleteLike(_id: ObjectId) : Promise<boolean>{
        const likeInstance = await LikesInfoModel.findOne({commentId:_id});
        if(!likeInstance)return false;
        await likeInstance.deleteOne();
        return true;    }
}