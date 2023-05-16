import {Router} from "express";
import {sessionRepository} from "../repositories/devises_in_repository";
import {jwtService} from "../application/jwt-service";
import {DeviceType} from "../models/devices_types";
export const devisesRouter = Router({});

devisesRouter.get('/', async (req, res)=>{
    try {
        const cookie: string = req.cookies.refreshToken
        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const id = checkToken?.id
        const sessions:DeviceType[]|undefined = await sessionRepository.getAllCurrentSessions(id)
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
        const id = checkToken?.id
        const sessions:boolean = await sessionRepository.deleteAllSession(id)
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
        const id = checkToken?.id
        const deviceId = checkToken?.deviceId
        const sessions:number = await sessionRepository.deleteOtherSession(id,deviceId)
        if(sessions && id === req.params.id){
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