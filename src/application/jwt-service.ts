import {ObjectId} from "mongodb";
import jwt from  'jsonwebtoken';

export const jwtService={
    async createAccess(id:ObjectId){
        const token = jwt.sign({userID:id}, "JWT_Secret",{expiresIn:'10'})
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
        return jwt.sign({userID:id}, 'refreshTokenPrivateKey', {expiresIn:'20'});
    },
    async verifyUserIdByRefreshToken(token:string):Promise<ObjectId|null>{
        try {
            const result:any = jwt.verify(token,"refreshTokenPrivateKey")
            return new  ObjectId(result.userID)
        }
        catch (error){
                return null;

        }
    }
}