import {ObjectId} from "mongodb";

export  type UserInputModel = {
    login: string,
    password: string,
    email: string
}
export type UserViewModel = {
    id:string,
    login:string,
    email:string,
    createdAt:string
}
export type LoginInputModel = {
    loginOrEmail:string,
    password:string
}
export type AccountDataType = {
    userName:string,
    email:string,
    userPasswordHash:string,
    userPasswordSalt:string,
    createdAt:string
}
export type UserAccountDbType = {
    _id:ObjectId,
    accountData: AccountDataType,
    emailConfirmation: {
        confirmationCode: string,
        expirationDate:Date,
        isConfirmed:boolean
    },
    likedComments:[],
    disLikedComments:[]
}
