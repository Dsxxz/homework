import {Router,Request,Response} from "express";
import {userService} from "../service/user-service";
/*import {
    userInputEmailValidation,
    userInputLoginValidation,
    userInputPasswordValidation
} from "../MiddleWares/input-user-validation";*/

export const authRouter = Router({});
authRouter.post('/login', async (req:Request,res:Response)=>{
   const checkResult:boolean = await userService.checkLoginAndPassword(req.body.loginOrEmail, req.body.password)
    if(checkResult){
        res.sendStatus(201)
    }
    //userInputLoginValidation,userInputEmailValidation,userInputPasswordValidation,
    else{
        res.sendStatus(401)
    }
})