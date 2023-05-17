import {NextFunction, Request, Response} from "express";
import {controlRequests} from "../repositories/control_requests";

export const ConnectionsCountChecker = async (req: Request, res: Response, next: NextFunction) => {
    const IP = req.ip
    try {
        const counter = await controlRequests.checkRequestForIP(IP)
        const deleteRequest = async () => {
            await controlRequests.deleteRequestForIP(IP);
            return;
        }
        setTimeout(deleteRequest, 10000)
        if (counter >= 5) {
            res.sendStatus(429);
            return;
        }
        next();
    } catch (e) {
        res.send(e)
    }
}