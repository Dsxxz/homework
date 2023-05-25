import {NextFunction, Request, Response} from "express";
import {controlRequests} from "../repositories/control_requests";
import {subSeconds} from "date-fns";

export const ConnectionsCountChecker = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip
    const url = req.baseUrl
    const date = new Date(Date.now())
    await controlRequests.addRequest(ip,url,date)
    const tenSecAgo = subSeconds(date, 10)
    const count = await controlRequests.checkRequest(ip,url,tenSecAgo)>5
    if(count){
        res.sendStatus(429)
        return;
    }
    next();
}