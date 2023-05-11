import {ObjectId} from "mongodb";

export type TokenType = {
    id: ObjectId,
    refreshToken : string,
    accessToken : string
}