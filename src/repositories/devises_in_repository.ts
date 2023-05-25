import {deviceTypeCollection} from "./db";
import {DeviceType} from "../models/devices_types"
import {ObjectId} from "mongodb";

export const devisesRepository= {
    async createNewSession(session:DeviceType){
        await deviceTypeCollection.insertOne(session);
        return;
},
    async deleteOneSessionById(deviceId:ObjectId){
        return await deviceTypeCollection.deleteOne({deviceId:new ObjectId(deviceId)});
    },
    async findOneSessions(deviceId:ObjectId|string):Promise<DeviceType|null>{
        return  await deviceTypeCollection.findOne({deviceId:new ObjectId(deviceId)});
    },

    async getAllCurrentSessions(userId:ObjectId):Promise<Array<DeviceType>|null>{
        const session:Array<DeviceType> = await deviceTypeCollection.find({userId:new ObjectId(userId)}).toArray()
        return session.length ? session : null;
    },

    async deleteAllSession(userId:ObjectId,deviceId:ObjectId):Promise<number>{
        const result = await deviceTypeCollection.deleteMany({userId:userId,deviceId:{$ne:deviceId}})
        return result.deletedCount;
    },
    async updateSession( lastActiveDate: string, deviceId: ObjectId){
        return await deviceTypeCollection.updateOne({deviceId},{$set:{lastActiveDate}})
    },
    async checkSessions(userId:ObjectId,ip: string, title:string) {
        return await deviceTypeCollection.findOne({userId:new ObjectId(userId),ip, title})
    },
    async findLastActiveDate(lastActiveDate: string) {
        return await deviceTypeCollection.findOne({lastActiveDate});
    }
}