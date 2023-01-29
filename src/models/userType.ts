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
export type UserInDbType={
    _id:ObjectId,
    login:string,
    email:string,
    userPasswordHash:string,
    userPasswordSalt:string,
    createdAt: string
}