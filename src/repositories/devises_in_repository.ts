import {DeviceModel} from "./db";
import {DeviceType} from "../models/devices_types"
import {ObjectId} from "mongodb";

export const devisesRepository= {
    async createNewSession(session:DeviceType){
        await DeviceModel.create(session);
        return;
},
    async deleteOneSessionById(deviceId:string){
        return  DeviceModel.deleteOne({deviceId:new ObjectId(deviceId)});
    },
    async findOneSessions(deviceId:ObjectId|string):Promise<DeviceType|null>{
        return   DeviceModel.findOne({deviceId:new ObjectId(deviceId)});
    },

    async getAllCurrentSessions(userId:ObjectId):Promise<Array<DeviceType>|null>{
        const session:Array<DeviceType> = await DeviceModel.find({userId:new ObjectId(userId)}).lean()
        return session.length ? session : null;
    },

    async deleteAllSession(userId:ObjectId,deviceId:ObjectId){
        return  DeviceModel.deleteMany({userId:userId,deviceId:{$ne:deviceId}});
    },
    async updateSession( lastActiveDate: string, deviceId: ObjectId){
        return  DeviceModel.updateOne({deviceId},{$set:{lastActiveDate}})
    },
    async checkSessions(userId:ObjectId,ip: string, title:string):Promise<DeviceType|null> {
        return  DeviceModel.findOne({userId:new ObjectId(userId),ip, title})
    },
    async findLastActiveDate(lastActiveDate: string):Promise<DeviceType|null> {
        return  DeviceModel.findOne({lastActiveDate});
    }
}