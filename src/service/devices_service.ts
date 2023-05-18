import {ObjectId} from "mongodb";
import {DeviceType, DeviceViewType} from "../models/devices_types";
import {devisesRepository} from "../repositories/devises_in_repository";


export const devicesService = {
    async getAllCurrentSessions(id: ObjectId):Promise<DeviceViewType[]|null> {
        const sessions = await devisesRepository.getAllCurrentSessions(id)
        if (sessions) return sessions.map(s => ({
                IP: s.ip,
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
    async findSessions(userId:ObjectId, checkTime:string, deviceId:ObjectId){
        return await devisesRepository.findSessions(userId, checkTime, deviceId)
    },
    async deleteCurrentSession(id:ObjectId){
        return await devisesRepository.deleteCurrentSessionSession(id);
    },
    async deleteAllSession(id:ObjectId){
        return  await devisesRepository.deleteAllSession(id);
    },
    async checkSessions(ip:string,userId:ObjectId,title: string) {
        return await devisesRepository.checkSessions(ip,userId,title)
    },
    async updateSession(userId: ObjectId, ip: string, title: string, timeTokenData: string, deviceId: ObjectId) {
        return await devisesRepository.updateSession(userId, ip, title, timeTokenData, deviceId);
    }
}