import {ObjectId} from "mongodb";
import {DeviceType, DeviceViewType} from "../models/devices_types";
import {DevisesRepository} from "../repositories/devises_in_repository";


export class DevicesService{
    protected devisesRepository:DevisesRepository
    constructor() {
        this.devisesRepository = new DevisesRepository()
    }
    async getAllCurrentSessions(id: ObjectId):Promise<DeviceViewType[]|null> {
        const sessions = await this.devisesRepository.getAllCurrentSessions(id)
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
    }
    async createNewSession(id:ObjectId,ip:string,title:string,lastActiveDate:string,deviceId:ObjectId){
        const newSession:DeviceType = {
            userId:id,
            ip:	ip,
            title:	title,
            lastActiveDate:lastActiveDate,
            deviceId:deviceId
        }
        await this.devisesRepository.createNewSession(newSession)
        return {
            deviceId:newSession.deviceId,
            ip:newSession.ip,
            lastActiveDate:newSession.lastActiveDate,
            title:newSession.title
        }
    }
    async findOneSessions(deviceId:ObjectId|string){
    return await this.devisesRepository.findOneSessions(deviceId)
}
    async deleteOneSessionById(deviceId:string){
        return await this.devisesRepository.deleteOneSessionById(deviceId);
    }
    async deleteAllSession(userId:ObjectId,deviceId:ObjectId){
        return  await this.devisesRepository.deleteAllSession(userId,deviceId);
    }
    async checkSessions(userId:ObjectId,ip:string,title:string) {
        return await this.devisesRepository.checkSessions(userId,ip, title)
    }
    async updateSession( timeTokenData: string, deviceId: ObjectId) {
        return await this.devisesRepository.updateSession(timeTokenData, deviceId);
    }
    async findLastActiveDate(date:string):Promise<DeviceType|null>{
        return this.devisesRepository.findLastActiveDate(date);
    }
}
