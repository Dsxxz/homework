import {ObjectId} from "mongodb";

export type TokenType = {
    _id: ObjectId,
    refreshToken : string,
    accessToken : string
}