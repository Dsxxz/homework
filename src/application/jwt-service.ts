import {ObjectId} from "mongodb";
import jwt from  'jsonwebtoken';
import {UserInDbType} from "../models/userType";
import {JWT_SECRET} from '../repositories/db'
export const jwtService={
    async createJWT(user:UserInDbType){
        const token = jwt.sign({userID:user._id}, JWT_SECRET,{expiresIn:'1h'})
        console.log('token in jwtService: ',token)
        return {
            resultCode:0,
            data:{
                token:token
            }
        }
    },
    async getUserIdByToken(token:string){
        try {
            const result:any = jwt.verify(token,JWT_SECRET)
            return new  ObjectId(result.userID)
        }
        catch (error){
            return null;
        }
    }
}