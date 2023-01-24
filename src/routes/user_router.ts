import {Router,Request,Response} from "express";
import {userService} from "../service/user-service";
export const userRouter = Router({});
import {userInputLoginValidation,userInputEmailValidation,userInputPasswordValidation} from "../MiddleWares/input-user-validation";
import {paginationType,userQueryService} from "../service/query-service";
import {UserViewModel} from "../models/userType";


userRouter.post('/',userInputLoginValidation,userInputEmailValidation,userInputPasswordValidation, async (req:Request,res:Response)=>{
    try{
        const newUser = userService.createNewUser(req.body.password, req.body.login, req.body.email)
        res.status(201).send(newUser)
    }
    catch (e){
        res.sendStatus(400)
    }
})
userRouter.get('/',async (req:Request<{},{},{},{pageNumber:string, pageSize:string, sortBy:string,
    searchLoginTerm:string,searchEmailTerm:string}>,res:Response)=>{
    try{
        const { pageNumber=1, pageSize=10, sortBy, searchLoginTerm,searchEmailTerm} = req.query;

        const users: Array<UserViewModel> = await userQueryService.findUsersByQuerySort( sortBy?.toString(),
            searchLoginTerm?.toString(),searchEmailTerm?.toString(),+pageNumber?.toString(),+pageSize?.toString())
        const paginator:paginationType = await userQueryService.paginationPage(+pageNumber,+pageSize)
        res.status(200).send({
            "pagesCount": paginator.pagesCount,
            "page": +pageNumber,
            "pageSize": +pageSize,
            "totalCount": paginator.totalCount,
            "items": users
        })
    }
    catch (e){
        res.sendStatus(401)
    }
})
userRouter.delete('/:id', async (req:Request,res:Response)=>{
    const deletedUser = await userService.deleteUser(req.params.id)
    if(!deletedUser){
        res.sendStatus(404)
    }
    else{
        res.sendStatus(204)
    }
})