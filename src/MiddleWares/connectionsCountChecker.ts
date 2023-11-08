import {NextFunction, Request, Response} from "express";
import {controlRequests} from "../repositories/control_requests";
import {subSeconds} from "date-fns";

export const ConnectionsCountChecker = async (req: Request, res: Response, next: NextFunction) => {
    const ip:string = req.ip || ''
    const url:string = req.originalUrl
    const date = new Date(Date.now())
    const tenSecAgo = subSeconds(date, 10)
    await controlRequests.addRequest(ip,url,date)
    const count = await controlRequests.checkRequest(ip,url,tenSecAgo)>5
    if(count){
        return res.sendStatus(429);
    }
    return next();
}