import {Router,Request,Response} from "express";
import {userService} from "../service/user-service";
import {
    userInputEmailValidation,
    userInputLoginValidation,
    userInputPasswordValidation
} from "../MiddleWares/input-user-validation";

export const authRouter = Router({});
authRouter.post('/login',userInputLoginValidation,userInputEmailValidation,userInputPasswordValidation, async (req:Request,res:Response)=>{
   const checkResult:boolean = await userService.checkLoginAndPassword(req.body.loginOrEmail, req.body.password)
    if(checkResult){
        res.sendStatus(201)
    }
    else{
        res.sendStatus(401)
    }
})