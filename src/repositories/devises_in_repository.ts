import {devisesCollectionDb} from "./db";
import {DeviceType} from "../models/devices_types"
import {ObjectId} from "mongodb";

export const sessionRepository= {
    async createNewSession(id:ObjectId,ip:string,title:string,lastActiveDate:string,deviceId:ObjectId): Promise<DeviceType> {
        const newSession:DeviceType = {
            userId:id,
            IP:	ip,
            title:	title,
            lastActiveDate:lastActiveDate,
            deviceId:deviceId
        }
        await devisesCollectionDb.insertOne(newSession);
        return newSession;
},
    async findSessions(IP:string,lastActiveDate:string,deviceId:ObjectId):Promise<DeviceType|null>{
       return  await devisesCollectionDb.findOne({IP,lastActiveDate,deviceId});
     },
    async deleteSession(userId:ObjectId, deviceId:ObjectId):Promise<boolean>{
        const result = await devisesCollectionDb.deleteOne({userId,deviceId})
        return result.deletedCount===1;
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