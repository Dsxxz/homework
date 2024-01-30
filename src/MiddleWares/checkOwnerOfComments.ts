import {NextFunction, Request, Response} from "express";
import {CommentsRepository} from "../repositories/comments_in_db_repository";
const commentsRepository = new CommentsRepository()
export const checkOwnerOfComments=async (req:Request,res:Response,next:NextFunction)=>{
    const comment = await commentsRepository.getCommentById(req.params.id)
    if(!comment){
        res.sendStatus(404)
        return;
    }
    if(req.user && req.user._id.toString() !== comment.commentatorInfo.userId){
        res.sendStatus(403);
        return;
    }
    next();
}