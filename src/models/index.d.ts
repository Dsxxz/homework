import {UserAccountDbType} from "./userType";

export declare global {
     namespace Express{
        export interface Request{
             user:UserAccountDbType|null
        }
    }
}