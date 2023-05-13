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
        return await tokensCollectionDb.insertOne(newToken)
    },
    async verifyTokens(refreshToken:string):Promise<ObjectId|null>{
       const token:TokenType|null = await tokensCollectionDb.findOne({refreshToken})
        if(token){
            return token.id
        }
        return null;
    }
}