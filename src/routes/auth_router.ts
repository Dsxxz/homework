import {Router,Request,Response} from "express";
import {userService} from "../service/user-service";
import {LoginInputModel, UserInDbType} from "../models/userType";
import {jwtService} from "../application/jwt-service";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";

export const authRouter = Router({});
authRouter.post('/login',
    async (req:Request<{},{},LoginInputModel>,res:Response)=>{
   const checkResult:UserInDbType|null= await userService.checkLoginAndPassword(req.body.loginOrEmail!, req.body.password!)
    if(checkResult){
        const token = await jwtService.createJWT(checkResult)
        console.log('token in authRouter: ',token)
        res.status(200).send({"accessToken":token})
    }
    else{
        res.sendStatus(401)
    }
})
authRouter.get('/me',authMiddleWare,async (req,res)=>{
    const email = req.user?.email
    const login = req.user?.login
    const userID = req.user?._id
    res.status(200).send({"email": email,
    "login": login,
    "userID": userID})
})