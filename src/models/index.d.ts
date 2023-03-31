import {UserAccountDbType} from "./userType";

export declare global {
    declare namespace Express{
        export interface Request{
             user:UserAccountDbType|null
        }
    }
}