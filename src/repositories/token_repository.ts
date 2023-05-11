import {ObjectId} from "mongodb";
import {tokensCollectionDb} from "./db";
import {TokenType} from "../models/tokens-types";

export const token_repository = {
    async destroyTokens (id:ObjectId){
        if (!ObjectId.isValid(id)) {
            return false;
        }
        const result = await tokensCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount === 1
    },
    async createList(userId:ObjectId, refreshToken:string,accessToken:string){
        const newTokens:TokenType = {id:userId,refreshToken:refreshToken,accessToken:accessToken}
        await tokensCollectionDb.insertOne(newTokens)
        return 1;
    },
    async changeTokensList(id:ObjectId, refreshToken:string,accessToken:string){
        if (!ObjectId.isValid(id)) {
            return null
        }
        const findList = await tokensCollectionDb.findOne({_id: id})
        if(findList){
                findList.accessToken=accessToken
                findList.refreshToken=refreshToken
            return 1;
        }
        return null;
    },
    async verifyTokens(refresh:string):Promise<ObjectId|null>{
       const token:TokenType|null = await tokensCollectionDb.findOne({refreshToken:refresh})
        if(token){
            return token.id
        }
        return null;
    }
}