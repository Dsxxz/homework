import {deviceTypeCollection} from "./db";
import {DeviceType} from "../models/devices_types"
import {ObjectId} from "mongodb";

export const devisesRepository= {
    async createNewSession(session:DeviceType){
        await deviceTypeCollection.insertOne(session);
        return;
},
    async findSessions(userId:ObjectId,deviceId:ObjectId):Promise<DeviceType|null>{
       return  await deviceTypeCollection.findOne({userId:new ObjectId(userId),deviceId:new ObjectId(deviceId)});
     },
    async deleteOneSessionById(deviceId:ObjectId){
        return await deviceTypeCollection.deleteOne({deviceId:new ObjectId(deviceId)});
    },

    async getAllCurrentSessions(userId:ObjectId):Promise<Array<DeviceType>|null>{
        const session:Array<DeviceType> = await deviceTypeCollection.find({userId:new ObjectId(userId)}).toArray()
        console.log('devisesRepository',userId, session, await deviceTypeCollection.find({userId}).toArray())
        return session.length ? session : null;
    },

    async deleteAllSession(userId:ObjectId,deviceId:ObjectId):Promise<boolean>{
        const result = await deviceTypeCollection.deleteMany({userId:new ObjectId(userId),$not:{deviceId:new ObjectId(deviceId)}})
        return !!result.deletedCount;
    },
    async updateSession( timeTokenData: string, deviceId: ObjectId):Promise<boolean> {
        const result = await deviceTypeCollection.updateOne({deviceId:new ObjectId(deviceId)},{$set:{timeTokenData}})
        return result.modifiedCount===1;
    },
    async checkSessions(userId:ObjectId,ip: string, title:string) {
        return await deviceTypeCollection.findOne({userId:new ObjectId(userId),ip, title})
    }
}