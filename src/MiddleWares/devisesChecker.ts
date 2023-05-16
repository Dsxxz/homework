import {NextFunction, Request, Response} from "express";
import {controlRequests} from "../repositories/control_requests";

export const DevisesChecker = async (req:Request,res:Response,next:NextFunction)=> {
    const IP = req.ip
    try {
    const counter = await controlRequests.checkRequestForIP(IP?.toString())
    const  deleteRequest = async () => {
        await controlRequests.deleteRequestForIP(IP?.toString());
        return;
    }
    setTimeout(deleteRequest, 10000)
    if (counter >= 5) {
        res.sendStatus(429);
        return;
    }
    next();
}
catch (e) {
    res.send(e)
}
}