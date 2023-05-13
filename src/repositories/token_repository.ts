import {ObjectId} from "mongodb";
import {tokensCollectionDb} from "./db";
import {TokenType} from "../models/tokens-types";

export const token_repository = {
    async destroyTokens (refreshToken:string){
        return await tokensCollectionDb.deleteOne({refreshToken});
    },
    async createList(id:ObjectId, refreshToken:string,accessToken:string){
        const newToken:TokenType = {id:id,refreshToken,accessToken}
        return await tokensCollectionDb.insertOne(newToken)
    },
    async verifyTokens(refreshToken:string):Promise<string|null>{
       const token:TokenType|null = await tokensCollectionDb.findOne({refreshToken})
        if(token){
            return refreshToken;
        }
        return null;
    }
}