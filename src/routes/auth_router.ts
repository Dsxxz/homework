import {Router,Request,Response} from "express";
import {userService} from "../service/user-service";

export const authRouter = Router({});
authRouter.post('/login',
    async (req:Request<{},{},{loginOrEmail:string,password:string}>,res:Response)=>{
   const checkResult:boolean= await userService.checkLoginAndPassword(req.body.loginOrEmail, req.body.password)
    if(checkResult){
        res.sendStatus(204)
    }

    else{
        res.sendStatus(401)
    }
})