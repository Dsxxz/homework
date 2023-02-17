import {NextFunction, Request, Response} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";

export const checkOwnerOfComments=async (req:Request,res:Response,next:NextFunction)=>{
    const comment = await commentsRepository.getCommentById(req.params.id)
    if(!comment){
        res.status(404).send("Comments doesn\'t exist" );
        return;
    }
    if(req.user?._id.toString()!==comment!.commentatorInfo.userId){
        res.status(403).send("You\'re not owner of this comment!");
        return;
    }
    next();
}