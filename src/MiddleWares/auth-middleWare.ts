import {NextFunction, Request, Response} from "express";
import {AuthService} from "../service/auth-service";
import {jwtService} from "../application/jwt-service";
import {ObjectId} from "mongodb";
const authService = new AuthService()
export const authMiddleWare = async (req:Request,res:Response,next:NextFunction)=>{
    if(!req.headers.authorization){
        res.sendStatus(401);
        return;
    }
    const token = req.headers.authorization.split(' ')[1]
    const userID:ObjectId = await jwtService.verifyUserIdByAccessToken(token)
    if(userID){
        req.user = await authService.findUsersById(userID)
        next();
    } else {
        res.sendStatus(401);
        return;
    }
}