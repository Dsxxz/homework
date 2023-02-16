import {NextFunction, Request, Response} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";

export const checkOwnerOfComments=async (req:Request,res:Response,next:NextFunction)=>{
    const comment = await commentsRepository.getCommentById(req.params.id)
    if(!comment){
        res.status(404).send({ errorsMessages:[{ message:"Comments doesn\'t exist", field: "content" }] });
        return;
    }
    if(req.user && req.user?._id.toString()!==comment!.commentatorInfo.userId){
        res.status(403).send({ errorsMessages:[{ message:"You\'re not owner of this comment!", field: "content" }] });
        return;
    }
    next();
}