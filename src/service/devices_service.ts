import {ObjectId} from "mongodb";
import {DeviceType, DeviceViewType} from "../models/devices_types";
import {devisesRepository} from "../repositories/devises_in_repository";


export const devicesService = {

    getAllCurrentSessions: async function (id: ObjectId):Promise<DeviceViewType[]|undefined> {
        const sessions = await devisesRepository.getAllCurrentSessions(id)
        return sessions?.map(s => ({
                IP: s.IP,
                title: s.title,
                lastActiveDate: s.lastActiveDate,
                deviceId: s.deviceId
            }
        ))
    },
    async createNewSession(id:ObjectId,ip:string,title:string,lastActiveDate:string,deviceId:ObjectId){
        const newSession:DeviceType = {
            userId:id,
            IP:	ip,
            title:	title,
            lastActiveDate:lastActiveDate,
            deviceId:deviceId
        }
        await devisesRepository.createNewSession(newSession)
        return {IP:newSession.IP,
            title:newSession.title,
            lastActiveDate:newSession.lastActiveDate,
            deviceId:newSession.deviceId
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
    }
}