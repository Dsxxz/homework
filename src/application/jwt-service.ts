import {ObjectId} from "mongodb";
import jwt from  'jsonwebtoken';

export const jwtService={
    async createAccess(id:ObjectId,ip:string,title:string,deviceId:string,timeNow:Date){
        const token = jwt.sign({id,ip,title,deviceId, iss:timeNow}, "JWT_Secret",{expiresIn:'10s'})
        return {
            resultCode:0,
            data:{
                token:token
            }
        }
        },
    async  createRefresh (id:ObjectId,ip:string,title:string,deviceId:string,timeNow:Date){
        return  jwt.sign({id,ip,title,deviceId, iss:timeNow}, 'refreshTokenPrivateKey', {expiresIn:'20s'});
    },

    async verifyUserIdByRefreshToken(token:string){
        try {
            const result:any = jwt.verify(token,"refreshTokenPrivateKey")
            const sessionData ={
                id:result.id,
                ip:result.ip,
                title:result.title,
                deviceId:result.deviceId,
                time:result.timeNow
            }
            return sessionData;
        }
        catch (error){
            console.log(error)
                return null;
        }
    },
    async verifyUserIdByAccessToken(token:string){
        try {
            const result: any = jwt.verify(token, "JWT_Secret")
            return result.id;
        }
        catch (error){
            return null;}
    }}