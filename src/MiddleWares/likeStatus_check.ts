import {body} from "express-validator";
import {likeEnum} from "../models/LikesInfoType";

export const likeStatusValidation = body('likeStatus').isString().trim()
    .exists({checkFalsy: true}).withMessage(`likeStatus should exist, field: "likeStatus"`).bail().custom( async ( value: likeEnum)=> {
        if(!Object.values(likeEnum).includes(value)){
            throw new Error('likeStatus doesnt correct')
        }
        else{
            return true;
        }
    })