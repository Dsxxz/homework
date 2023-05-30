import {Router} from "express";
import {jwtService} from "../application/jwt-service";
import {DeviceViewType} from "../models/devices_types";
import {devicesService} from "../service/devices_service";
export const devicesRouter = Router({});

devicesRouter.get('/', async (req, res)=>{
    try {
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const time = await jwtService.getLastActiveDateFromRefreshToken(cookie)
        const session = await devicesService.findLastActiveDate(time)
        if(!checkToken || !session){
            res.sendStatus(401);
            return;
        }
        const sessions:Array<DeviceViewType>|null = await devicesService.getAllCurrentSessions(checkToken.userId)
        if(sessions){
            res.status(200).send(sessions)
            return;
        }
        else {
            res.sendStatus(401);
            return;
        }
    }
    catch (e) {
        console.log('devicesRouter.get',e);
        return;
    }
})

devicesRouter.delete('/', async (req, res)=>{
    try{
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const time = await jwtService.getLastActiveDateFromRefreshToken(cookie)
        const session = await devicesService.findLastActiveDate(time)
        if(checkToken && session){
            await devicesService.deleteAllSession(session.userId,session.deviceId)
            res.sendStatus(204);
            return;
        }
        else{
            res.sendStatus(401);
            return;
        }
    }
    catch (e) {
        console.log('devicesRouter.delete(\'/\'',e);
    }
})

devicesRouter.delete('/:id', async (req, res)=>{
    try {
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const time = await jwtService.getLastActiveDateFromRefreshToken(cookie)
        const session = await devicesService.findLastActiveDate(time)
        const checkUserId = await devicesService.findOneSessions(req.params.id)
        if(checkToken?.userId!==checkUserId?.userId.toString()){
            res.sendStatus(403);
            return;
        }
        if (!checkUserId) {
            res.sendStatus(404);
            return;
        }
        if (!session) {
            res.sendStatus(401);
            return;
        }
        else {
            await devicesService.deleteOneSessionById(req.params.id)
            console.log(await devicesService.findOneSessions(req.params.id))
            res.sendStatus(204);
            return;
        }
    }
    catch (e) {
        console.log('devicesRouter.delete(\'/:id',e)
        return;
    }
})