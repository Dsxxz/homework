import {Request, Response, Router} from "express";
import {jwtService} from "../application/jwt-service";
import {DeviceType, DeviceViewType} from "../models/devices_types";
import {DevicesService} from "../service/devices_service";
export const devicesRouter = Router({});

class DeviseController{
    private devicesService: DevicesService;
    constructor() {
        this.devicesService = new DevicesService()
    }
    async getSessions(req: Request, res: Response){
        try {
            const refresh = await jwtService.verifyUserIdByRefreshToken(req.cookies.refreshToken)
            if(!refresh){
                res.sendStatus(401);
                return;
            }
            const lastActiveDate = await jwtService.getLastActiveDateFromRefreshToken(req.cookies.refreshToken)
            if(!lastActiveDate){
                res.sendStatus(401);
                return;
            }
            const session = await this.devicesService.findLastActiveDate(lastActiveDate)
            const sessions:Array<DeviceViewType>|null = await this.devicesService.getAllCurrentSessions(refresh?.userId)
            if(sessions && session){
                res.status(200).send(sessions)
                return;
            }
            else {
                res.sendStatus(401);
                return;
            }
        }
        catch (e) {
            console.log(e);
            return;
        }
    }
    async deleteAllSessions(req: Request, res: Response){
        try{
            const checkToken = await jwtService.verifyUserIdByRefreshToken(req.cookies.refreshToken)
            if(!checkToken){
                res.sendStatus(401);
                return;
            }
            const time = await jwtService.getLastActiveDateFromRefreshToken(req.cookies.refreshToken)
            if(!time){
                res.sendStatus(401);
                return;
            }
            const session:DeviceType|null= await this.devicesService.findLastActiveDate(time)
            if(session && checkToken){
                await this.devicesService.deleteAllSession(session.userId,session.deviceId)
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
    }
    async deleteOneSession(req: Request, res: Response){
        try {
            const cookie: string = req.cookies.refreshToken
            const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
            if(!checkToken){
                res.sendStatus(401);
                return;
            }
            const time = await jwtService.getLastActiveDateFromRefreshToken(cookie)
            if(!time){
                res.sendStatus(401);
                return;
            }
            const session = await this.devicesService.findLastActiveDate(time)
            const checkUserId = await this.devicesService.findOneSessions(req.params.id)
            if (!checkUserId) {
                res.sendStatus(404);
                return;
            }
            if (!session) {
                res.sendStatus(401);
                return;
            }
            if(checkToken?.userId!==checkUserId?.userId.toString()){
                res.sendStatus(403);
                return;
            }
            else {
                await this.devicesService.deleteOneSessionById(req.params.id)
                res.sendStatus(204);
                return;
            }
        }
        catch (e) {
            console.log(e)
            return;
        }
    }
}
const deviseController = new DeviseController()
devicesRouter.get('/', deviseController.getSessions.bind(deviseController))
devicesRouter.delete('/', deviseController.deleteAllSessions.bind(deviseController))
devicesRouter.delete('/:id', deviseController.deleteOneSession.bind(deviseController))