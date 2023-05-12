import {ObjectId} from "mongodb";
import {tokensCollectionDb} from "./db";
import {TokenType} from "../models/tokens-types";

export const token_repository = {
    async destroyTokens (id:ObjectId):Promise<boolean>{
        const result = await tokensCollectionDb.deleteOne({_id:id})
        return result.deletedCount === 1
    },
    async createList(userId:ObjectId, refreshToken:string,accessToken:string){
        const newTokens:TokenType = {id:userId,refreshToken:refreshToken,accessToken:accessToken}
        await tokensCollectionDb.insertOne(newTokens)
        return 1;
    },
    async changeTokensList(id:ObjectId, refreshToken:string,accessToken:string){
        const result = await tokensCollectionDb.updateOne({_id:id}, {$set: {refreshToken,accessToken}})
        console.log(result.modifiedCount)
        return result.modifiedCount === 1;
    },
    async verifyTokens(refreshToken:string):Promise<ObjectId|null>{
       const token:TokenType|null = await tokensCollectionDb.findOne({refreshToken})
        if(token){
            return token.id
        }
        return null;
    }
}