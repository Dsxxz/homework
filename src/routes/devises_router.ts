import {Router} from "express";
import {devisesRepository} from "../repositories/devises_in_repository";
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

devicesRouter.delete('/:id', async (req, res)=>{
    if(!req.params.id ){
        res.sendStatus(404);
        return;
    }
    try{
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const userId:ObjectId = checkToken?.userId
        const sessions:number = await devisesRepository.deleteOtherSession(userId,checkToken?.deviceId)
        if(checkToken){
            res.sendStatus(401);
            return;
        }
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