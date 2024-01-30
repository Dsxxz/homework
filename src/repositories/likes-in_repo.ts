import {ObjectId} from "mongodb";
import {LikesInfoModel} from "./db";
import {HydratedDocument} from "mongoose";
import {LikedType} from "../models/LikesInfoType";

class LikesRepo{
    async saveLike(like:HydratedDocument<LikedType>):Promise<HydratedDocument<LikedType>>{
       return await like.save();
    }
    async createOrUpdateLike(commentOrPostId:ObjectId, userId:ObjectId, field:string, status: string):Promise<HydratedDocument<LikedType>|null|boolean>{
        if(status==="None"){
            return this.deleteLike(commentOrPostId)
        }
        const findLike = await LikesInfoModel.findOne({commentOrPostId:commentOrPostId,userId:userId,field:field})
        if(!findLike){
            const like = new LikesInfoModel({
                _id:new ObjectId(),
                commentOrPostId:commentOrPostId,
                status: status,
                createdAt: new Date().toISOString(),
                userId: userId,
                field:field})
            await this.saveLike(like)
            return like;
        }
        else{
            return LikesInfoModel.findOneAndUpdate({commentOrPostId:commentOrPostId,userId:userId},{ $set:{status:status}})
        }
    }
    async findLike(commentOrPostId:ObjectId):Promise<LikedType[]|null>{
        return LikesInfoModel.find({commentOrPostId:commentOrPostId}).lean()
    }
    async deleteLike(_id: ObjectId) : Promise<boolean>{
        const likeInstance = await LikesInfoModel.findOne({commentOrPostId:_id});
        if(!likeInstance)return false;
        await likeInstance.deleteOne();
        return true;
    }
    async deleteLikes(commentOrPostId: ObjectId) {
        await LikesInfoModel.updateMany()
        return LikesInfoModel.deleteMany({commentOrPostId:commentOrPostId})
    }

    async findLatestLikes(postId: ObjectId):Promise<any[]> {
        return  LikesInfoModel.aggregate([
            {
                $match: { commentOrPostId: postId }
            },
            {
                $addFields: {
                    createdAtDate: {$dateFromString: {dateString: "$createdAt"}}
                }
            },
            {
                $sort: {createdAtDate: -1}
            },
            {
                $limit: 3
            }
        ])
    }
}
export const likesRepo=new LikesRepo()