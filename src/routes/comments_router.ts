import { Router,Request,Response} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {checkOwnerOfComments} from "../MiddleWares/checkOwnerOfComments";
import {CommentInputContentValidation} from "../MiddleWares/input-comment-validation";
import {inputCommentsValidation} from "../MiddleWares/validation-middleware";

export const commentsRouter = Router({});

commentsRouter.get('/:id',async (req,res)=>{
    const findComment = await commentsRepository.getCommentById(req.params.id)
    if(!findComment){
        res.sendStatus(404);
        return;
    }
    console.log(findComment)
    res.status(200).send(findComment);
    return;
})
commentsRouter.delete('/:id',
    checkOwnerOfComments,
    authMiddleWare,
    inputCommentsValidation,
    async (req,res)=>{
    const findComment = await commentsRepository.deleteComment(req.params.id)
    if(!findComment){
        res.sendStatus(404);
        return;
    }
    res.sendStatus(204);
    return;
})
commentsRouter.put('/:id',
    CommentInputContentValidation,
    checkOwnerOfComments,
    authMiddleWare,
    inputCommentsValidation,
    async (req:Request<{ id: string }, {}, {content: string}>, res:Response)=>{
    const findComment = await commentsRepository.updateComment(req.params.id,req.body.content)
    if(!findComment){
        res.sendStatus(404)
    }

    res.status(204).send(await commentsRepository.getCommentById(req.params.id))
})