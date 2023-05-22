import {NextFunction, Request, Response} from "express";
import {controlRequests} from "../repositories/control_requests";

export const ConnectionsCountChecker = async (req: Request, res: Response, next: NextFunction) => {
    const IP = req.ip
    try {
        const counter = await controlRequests.checkRequestForIP(IP)
        const deleteRequest = async () => {
            await controlRequests.deleteRequestForIP(IP);
            next();
        }
        setTimeout(deleteRequest, 10000)
        if (counter >= 5) {
            res.status(429);
            next();
        }
    } catch (e) {
        res.send(e)
    }
}