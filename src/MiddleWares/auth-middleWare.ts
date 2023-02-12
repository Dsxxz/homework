import {NextFunction, Request, Response} from "express";
import {userService} from "../service/user-service";
import {jwtService} from "../application/jwt-service";

export const authMiddleWare = async (req:Request,res:Response,next:NextFunction)=>{
    if(!req.headers.authorization){
        res.sendStatus(401);
        return;
    }
    const token = req.headers.authorization.split(' ')[1]
    const userID = await jwtService.getUserIdByToken(token)
    if(userID){
        req.user = await userService.findUsersById(userID)
        next();
    } else {
        res.sendStatus(401);
        return;
    }
}