import { Router,Request,Response} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {checkOwnerOfComments} from "../MiddleWares/checkOwnerOfComments";
import {CommentInputContentValidation} from "../MiddleWares/input-comment-validation";
import {inputCommentsValidation, inputLikesValidation} from "../MiddleWares/validation-middleware";

import {likeStatusValidation} from "../MiddleWares/likeStatus_check";
import {jwtService} from "../application/jwt-service";
import {ObjectId} from "mongodb";
import {authService} from "../service/auth-service";

export const commentsRouter = Router({});



commentsRouter.get('/:id',async (req:Request<{id:string}>,res:Response)=>{
    const findComment = await commentsRepository.getCommentById(req.params.id)
    console.log(findComment)
    if(!findComment){
        res.sendStatus(404);
        return;
    }
    const token = req.headers.authorization?.split(' ')[1]
    let userId: ObjectId | null
    if (token) {
         userId = await jwtService.verifyUserIdByAccessToken(token)
    }
    else{  userId = null }
    const status =userId ? await commentsRepository.getLikeStatus(req.params.id, userId) : "None"
    res.status(200).send({id:findComment._id.toString(),
        commentatorInfo:findComment.commentatorInfo,
        content:findComment.content,
        createdAt:findComment.createdAt,
        likesInfo: {
            likesCount: findComment.likesInfo.likesCount.length,
            dislikesCount: findComment.likesInfo.dislikesCount.length,
            myStatus: status
        }
    });
    return;
})
commentsRouter.delete('/:id',
    authMiddleWare,
    checkOwnerOfComments,
    inputCommentsValidation,
    async (req:Request<{ id: string }>,res:Response)=>{
    const findComment = await commentsRepository.deleteComment(req.params.id)
    if(!findComment){
        res.sendStatus(404);
        return;
    }
    res.sendStatus(204);
    return;
})
commentsRouter.put('/:id',
    authMiddleWare,
    CommentInputContentValidation,
    checkOwnerOfComments,
    inputCommentsValidation,
    async (req:Request<{ id: string }, {}, {content: string}>, res:Response)=>{
    const findComment = await commentsRepository.updateComment(req.params.id,req.body.content)
    if(!findComment){
        res.sendStatus(404);
        return;
    }

    res.status(204).send(await commentsRepository.getCommentById(req.params.id));
    return;
})
commentsRouter.put('/:id/like-status',
    authMiddleWare,
    likeStatusValidation,
    inputLikesValidation,
    async (req:Request<{ id: string },{},{likeStatus:string}>,res:Response)=>{
        const findComment = await commentsRepository.getCommentById(req.params.id)
        if(!findComment){
            res.sendStatus(404);
            return;
        }
        try{
            const token = req.headers.authorization!.split(' ')[1]
            const userId:ObjectId = await jwtService.verifyUserIdByAccessToken(token)
            const newStatus = req.body.likeStatus
            if(newStatus==="Like" ){
                await authService.setLikeForComment(userId,new ObjectId(req.params.id));
                return res.sendStatus(204);
            }
            if(newStatus==="Dislike"){
                await authService.setDisLikeForComment(userId,new ObjectId(req.params.id));
                return res.sendStatus(204);
            }
            if(newStatus==="None"){
                return res.sendStatus(204);
            }
            else{
                return res.sendStatus(400);
            }
        }
        catch (e) {
            console.log("commRouter/put/comments/id/likeStatus", e)
            res.status(500).send(e);
            return;
        }
})