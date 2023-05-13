import {ObjectId} from "mongodb";
import jwt from  'jsonwebtoken';

export const jwtService={
    async createAccess(id:ObjectId){
        const token = jwt.sign({userID:id}, "JWT_Secret",{expiresIn:'10s'})
        return {
            resultCode:0,
            data:{
                token:token
            }
        }
        },
    async verifyUserIdByAccessToken(token:string):Promise<ObjectId|null>{
        try {
            const result:any = jwt.verify(token,"JWT_Secret")
            return new  ObjectId(result.userID)
        }
        catch (error){
                return null;}
    },
    async  createRefresh (id:ObjectId){
        return  jwt.sign({userID:id}, 'refreshTokenPrivateKey', {expiresIn:'30s'});
    },
    async verifyUserIdByRefreshToken(token:string):Promise<ObjectId|null>{
        try {
            const result:any = jwt.verify(token,"refreshTokenPrivateKey")
            return new  ObjectId(result.userID)
        }
        catch (error){
            console.log(error)
                return null;
        }
    },
    async checkToken(token:string):Promise<string|null>{
        try {
            const result:any = jwt.verify(token,"JWT_Secret")
            if(result){return token}
            return null;
        }
        catch (error){
            return null;}
    }}