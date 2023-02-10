import {UserInDbType} from "./userType";

declare global {
    declare namespace Express{
        export interface Request{
             user:UserInDbType|null
        }
    }
}