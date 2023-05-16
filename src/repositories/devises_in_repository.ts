import {devisesCollectionDb} from "./db";
import {DeviceType} from "../models/devices_types"
import {ObjectId} from "mongodb";

export const sessionRepository= {
    async createNewSession(id:ObjectId,ip:string,title:string,lastActiveDate:Date,deviceId:string): Promise<DeviceType> {
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
    async findSessions(id:ObjectId,IP:string,title:string,lastActiveDate:Date,deviceId:string):Promise<DeviceType|null>{
       return  await devisesCollectionDb.findOne({userId: id,IP,title,lastActiveDate,deviceId});
     },
    async deleteSession(id:ObjectId,IP:string,title:string,lastActiveDate:Date,deviceId:string):Promise<boolean>{
        const result = await devisesCollectionDb.deleteOne({userId: id,IP,title,lastActiveDate,deviceId})
        return result.deletedCount===1;
    },
    async getAllCurrentSessions(id:ObjectId):Promise<DeviceType[]|undefined>{
        const result:DeviceType[]|undefined = await devisesCollectionDb.find({userId: id}).toArray()
        return result;
},
    async deleteAllSession(id:ObjectId):Promise<boolean>{
        const result = await devisesCollectionDb.deleteMany({userId: id})
        return result.deletedCount===1;
    },
    async deleteOtherSession(id:ObjectId,deviceId:string):Promise<number>{
        const result = await devisesCollectionDb.deleteMany({userId: id,deviceId:{$not : {deviceId} }})
        return result.deletedCount
    }
}