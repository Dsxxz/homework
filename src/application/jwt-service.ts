import {ObjectId} from "mongodb";
import jwt from  'jsonwebtoken';
import {UserAccountDbType} from "../models/userType";

export const jwtService={
    async createJWT(user:UserAccountDbType){
        const token = jwt.sign({userID:user._id}, "JWT_Secret",{expiresIn:'1h'})
        return {
            resultCode:0,
            data:{
                token:token
            }
        }
        },
    async getUserIdByToken(token:string){
        try {
            const result:any = jwt.verify(token,"JWT_Secret")
            return new  ObjectId(result.userID)
        }
        catch (error){
            return null;
        }
    },
    async  signToken (user: UserAccountDbType){
        return jwt.sign({userID:user._id}, 'refreshTokenPrivateKey', {expiresIn:'10m'});
    }
}