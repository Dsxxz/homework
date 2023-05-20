import {Router} from "express";
import {jwtService} from "../application/jwt-service";
import {DeviceViewType} from "../models/devices_types";
import {ObjectId} from "mongodb";
import {devicesService} from "../service/devices_service";
export const devicesRouter = Router({});

devicesRouter.get('/', async (req, res)=>{
    try {
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const sessions:Array<DeviceViewType>|null = await devicesService.getAllCurrentSessions(checkToken?.userId)
        console.log('devisesRouter',sessions)
        if(checkToken && sessions ){
            res.status(200).send(sessions)
        }
        else{
            res.sendStatus(401)
        }
    }
    catch (e) {
        console.log(e);
        return;
    }
})

devicesRouter.delete('/', async (req, res)=>{
    try{
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        if(!checkToken){
            res.sendStatus(401);
            return;
        }
        else{
            const sessions:boolean = await devicesService.deleteAllSession(checkToken.userId,checkToken.deviceId)
            console.log('sessions',sessions)
            if(sessions){
                res.sendStatus(204);
                return;
            }
            return;
        }
    }
    catch (e) {
        console.log(e);
    }
})

devicesRouter.delete('/:id', async (req, res)=>{
    try{
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const checkId = await devicesService.findSessions(checkToken?.userId,new ObjectId(req.params.id))
        const session = await devicesService.findSessions(checkToken?.userId,checkToken?.deviceId)
        if(session){
        await devicesService.deleteOneSessionById(checkToken?.deviceId)
        res.sendStatus(204);
        return;
        }
        if(!checkId){
            res.sendStatus(404);
            return;
        }
        if(!checkId?.userId && checkId?.userId!==checkToken?.userId){
            res.sendStatus(403);
            return;
        }
        if(!checkToken){
            res.sendStatus(401);
            return;
        }
        return;
    }
    catch (e) {
        return;
    }
})