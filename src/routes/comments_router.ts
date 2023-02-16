import { Router} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {checkOwnerOfComments} from "../MiddleWares/checkOwnerOfComments";
import {CommentInputValidation} from "../MiddleWares/input-comment-validation";

export const commentsRouter = Router({});

commentsRouter.get('/:id',async (req,res)=>{
    const findComment = await commentsRepository.getAllCommentsForSpecificPost(req.params.id)
    if(!findComment){
        res.sendStatus(404);
        return;
    }
    res.status(200).send(findComment);
    return;
})
commentsRouter.delete('/:id',checkOwnerOfComments,authMiddleWare,async (req,res)=>{
    const findComment = await commentsRepository.deleteComment(req.params.id)
    if(!findComment){
        res.sendStatus(404);
        return;
    }
    res.sendStatus(204);
    return;
})
commentsRouter.put('/:id',CommentInputValidation,checkOwnerOfComments,authMiddleWare, async (req,res)=>{
    const findComment = await commentsRepository.updateComment(req.params.id,req.body.content)
    if(!findComment){
        res.sendStatus(404)
    }
    res.sendStatus(204)
})