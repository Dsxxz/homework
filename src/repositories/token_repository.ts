import {ObjectId} from "mongodb";
import {tokensCollectionDb} from "./db";
import {TokenType} from "../models/tokens-types";

export const token_repository = {
    async destroyTokens (id:ObjectId):Promise<boolean>{
        const result = await tokensCollectionDb.deleteOne({id})
        return result.deletedCount === 1
    },
    async createList(id:ObjectId, refreshToken:string,accessToken:string){
        const newToken:TokenType = {id:id,refreshToken,accessToken}
        await tokensCollectionDb.insertOne(newToken)
        return;
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