import {ObjectId} from "mongodb";
import {tokensCollectionDb} from "./db";
import {TokenType} from "../models/tokens-types";

export const token_repository = {
    async destroyTokens (id:ObjectId):Promise<boolean>{
        const result = await tokensCollectionDb.deleteOne({id})
        console.log(result.deletedCount)
        return result.deletedCount === 1
    },
    async createList(id:ObjectId, refreshToken:string,accessToken:string){
        const newTokens:TokenType = {id:id,refreshToken:refreshToken,accessToken:accessToken}
        await tokensCollectionDb.insertOne(newTokens)
        return 1;
    },
    async changeTokensList(id:ObjectId, refreshToken:string,accessToken:string){
        const result = await tokensCollectionDb.updateOne({id}, {$set: {refreshToken:refreshToken,accessToken:accessToken}})
        return result.matchedCount === 1;
    },
    async verifyTokens(refreshToken:string):Promise<ObjectId|null>{
       const token:TokenType|null = await tokensCollectionDb.findOne({refreshToken:refreshToken})
        if(token){
            return token.id
        }
        return null;
    }
}