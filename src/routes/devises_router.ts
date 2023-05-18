import {Router} from "express";
import {devisesRepository} from "../repositories/devises_in_repository";
import {jwtService} from "../application/jwt-service";
import {DeviceViewType} from "../models/devices_types";
import {ObjectId} from "mongodb";
import {devicesService} from "../service/devices_service";
export const devisesRouter = Router({});

devisesRouter.get('/', async (req, res)=>{
    try {
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const id = checkToken?.deviceId
        const sessions:DeviceViewType[]|undefined = await devicesService.getAllCurrentSessions(id)
        if(sessions){
            res.status(200).send( sessions.map(s=>({
                IP: s.IP,
                title: s.title,
                lastActiveDate: s.lastActiveDate,
                deviceId: s.deviceId}
        )))}
        else{
            res.sendStatus(401)
        }
    }
    catch (e) {
        console.log(e);
        return;
    }
})

devisesRouter.delete('/', async (req, res)=>{
    try{
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const id:ObjectId = checkToken?.deviceId
        const sessions:boolean = await devicesService.deleteAllSession(id)
        if(sessions){
            res.sendStatus(204);
            return;
        }
        else{
            res.sendStatus(401);
            return;
        }
    }
    catch (e) {
        console.log(e);
    }
})

devisesRouter.delete('/:id', async (req, res)=>{
    try{
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const userId:ObjectId = checkToken?.userId
        const deviceId:ObjectId = checkToken?.deviceId
        const sessions:number = await devisesRepository.deleteOtherSession(userId,deviceId)
        if(sessions){
            res.sendStatus(204);
            return;
        }
        else{
            res.sendStatus(401);
            return;
        }

    }
    catch (e) {

    }
})