import {ObjectId} from "mongodb";
import {DeviceType, DeviceViewType} from "../models/devices_types";
import {devisesRepository} from "../repositories/devises_in_repository";


export const devicesService = {
    async getAllCurrentSessions(id: ObjectId):Promise<DeviceViewType[]|null> {
        const sessions = await devisesRepository.getAllCurrentSessions(id)
        if (sessions) return sessions.map(s => ({
                ip: s.ip,
                title: s.title,
                lastActiveDate: s.lastActiveDate,
                deviceId: s.deviceId
            }
        ))
        else {
            return  null;
        }
    },
    async createNewSession(id:ObjectId,ip:string,title:string,lastActiveDate:string,deviceId:ObjectId){
        const newSession:DeviceType = {
            userId:id,
            ip:	ip,
            title:	title,
            lastActiveDate:lastActiveDate,
            deviceId:deviceId
        }
        await devisesRepository.createNewSession(newSession)
        return {
            deviceId:newSession.deviceId,
            ip:newSession.ip,
            lastActiveDate:newSession.lastActiveDate,
            title:newSession.title
        }
    },
    async findOneSessions(deviceId:ObjectId){
    return await devisesRepository.findOneSessions(deviceId)
},
    async deleteOneSessionById(deviceId:ObjectId){
        return await devisesRepository.deleteOneSessionById(deviceId);
    },
    async deleteAllSession(userId:ObjectId,deviceId:ObjectId){
        return  await devisesRepository.deleteAllSession(userId,deviceId);
    },
    async checkSessions(userId:ObjectId,ip:string,title:string) {
        return await devisesRepository.checkSessions(userId,ip, title)
    },
    async updateSession( timeTokenData: string, deviceId: ObjectId) {
        return await devisesRepository.updateSession(timeTokenData, deviceId);
    },
    async findLastActiveDate(date:string){
        return await devisesRepository.findLastActiveDate(date);
    }
}