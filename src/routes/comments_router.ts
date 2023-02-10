import { Router,Request,Response} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";

export const commentsRouter = Router({});

commentsRouter.get('/:id',async (req,res)=>{
    const findComment = await commentsRepository.getCommentById(req.params.id)
    if(!findComment){
        res.sendStatus(404)
    }
    res.status(200).send(findComment)
})
commentsRouter.delete('/:id',async (req,res)=>{
    const findComment = await commentsRepository.deleteComment(req.params.id)
    if(!findComment){
        res.sendStatus(404)
    }
    res.sendStatus(204)
})
