import {UserInDbType} from "./userType";

export declare global {
    declare namespace Express{
        export interface Request{
             user:UserInDbType|null
        }
    }
}