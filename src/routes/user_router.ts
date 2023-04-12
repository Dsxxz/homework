import {Router,Request,Response} from "express";
export const userRouter = Router({});
import {userInputLoginValidation,userInputEmailValidation,userInputPasswordValidation} from "../MiddleWares/input-user-validation";
import {userQueryService} from "../service/query-service";
import {UserAccountDbType, UserInputModel, UserViewModel} from "../models/userType";
import {inputUserValidation} from "../MiddleWares/validation-middleware"
import {basicAuth} from "../MiddleWares/admin_basic_autorization";
import {paginationType} from "../models/query_input_models";
import {authService} from "../service/auth-service";




userRouter.post('/',basicAuth,userInputLoginValidation,userInputEmailValidation,
    userInputPasswordValidation,inputUserValidation,async (req:Request<{},{},UserInputModel>, res:Response)=> {
        try {
            const newUser: UserAccountDbType | null = await authService.createNewUser(req.body.password!, req.body.login!, req.body.email!)
            if (newUser) {
                res.status(201).send({
                    id:newUser._id.toString(),
                    login:newUser.accountData.userName,
                    email:newUser.accountData.email,
                    createdAt:newUser.accountData.createdAt
                });
            }
        }
        catch (e){
            throw new Error('e')
        }
    })
userRouter.get('/',basicAuth,async (req:Request<{},{},{},{pageNumber:string, pageSize:string, sortBy:string,
    searchLoginTerm:string,searchEmailTerm:string,sortDirection:string}>,res:Response)=>{
    try{
        const { pageNumber=1, pageSize=10, sortBy, searchLoginTerm,searchEmailTerm,sortDirection='desc'} = req.query;

        const users: Array<UserViewModel> = await userQueryService.findUsersByQuerySort( sortBy?.toString(),
            searchLoginTerm?.toString(),searchEmailTerm?.toString(),+pageNumber?.toString(),+pageSize?.toString(),sortDirection?.toString())
        const paginator:paginationType = await userQueryService.paginationPage(searchLoginTerm?.toString(),searchEmailTerm?.toString(),+pageNumber?.toString(),+pageSize?.toString())
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
userRouter.delete('/:id', basicAuth, async (req:Request,res:Response)=>{
    const deletedUser = await authService.deleteUser(req.params.id)
    if(!deletedUser){
        res.sendStatus(404)
    }
    else{
        res.sendStatus(204)
    }
})