import {devisesCollectionDb} from "./db";
import {DeviceType} from "../models/devices_types"
import {ObjectId} from "mongodb";

export const devisesRepository= {
    async createNewSession(session:DeviceType){
        await devisesCollectionDb.insertOne(session);
        return;
},
    async findSessions(userId:ObjectId,lastActiveDate:string,deviceId:ObjectId):Promise<DeviceType|null>{
       return  await devisesCollectionDb.findOne({userId,lastActiveDate,deviceId});
     },
    async deleteCurrentSessionSession(deviceId:ObjectId){
        return await devisesCollectionDb.deleteOne({deviceId})
    },

    async getAllCurrentSessions(id:ObjectId):Promise<DeviceType[]|undefined>{
        return await devisesCollectionDb.find({deviceId: id}).toArray()
},

    async deleteAllSession(id:ObjectId):Promise<boolean>{
        const result = await devisesCollectionDb.deleteMany({deviceId: id})
        return result.deletedCount===1;
    },
    async deleteOtherSession(userId:ObjectId, deviceId:ObjectId):Promise<number>{
        const result = await devisesCollectionDb.deleteMany({userId,ip:{$not : {deviceId} }})
        return result.deletedCount
    }
}