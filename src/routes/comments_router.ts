import { Router,Request,Response} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {checkOwnerOfComments} from "../MiddleWares/checkOwnerOfComments";
import {CommentInputContentValidation} from "../MiddleWares/input-comment-validation";
import {inputCommentsValidation, inputLikesValidation} from "../MiddleWares/validation-middleware";

import {likeStatusValidation} from "../MiddleWares/likeStatus_check";
import {jwtService} from "../application/jwt-service";
import {ObjectId} from "mongodb";

export const commentsRouter = Router({});



commentsRouter.get('/:id',async (req:Request<{id:string}>,res:Response)=>{
    const findComment = await commentsRepository.getCommentById(req.params.id)
    if(!findComment){
        res.sendStatus(404);
        return;
    }
    console.log(findComment)
    res.status(200).send({id:findComment._id.toString(),
        commentatorInfo:findComment.commentatorInfo,
        content:findComment.content,
        createdAt:findComment.createdAt,
        likesInfo: {
            likesCount: findComment.likesInfo.likesCount.length,
            dislikesCount: findComment.likesInfo.dislikesCount.length,
            myStatus: "None"
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
            const findStatus= await commentsRepository.getLikeStatus(findComment._id,userId)
            if(findStatus.userDisliked && findStatus.userDisliked.likesInfo.myStatus===req.body.likeStatus){
                return res.sendStatus(204)
            }
            if(findStatus.userLiked && findStatus.userLiked.likesInfo.myStatus===req.body.likeStatus){
                return res.sendStatus(204)
            }
            if(req.body.likeStatus==="Like"){
                await commentsRepository.setLike(findComment._id,req.body.likeStatus,userId)
                return res.sendStatus(204)
            }
            if(req.body.likeStatus==="Dislike"){
                await commentsRepository.setDislike(findComment._id,req.body.likeStatus,userId)
                return res.sendStatus(204)
            }else{
                await commentsRepository.setNonLike(findComment._id,req.body.likeStatus,userId)
                return res.sendStatus(204)
            }
        }
        catch (e) {
            console.log("commRouter/put/comments/id/likeStatus", e)
            res.status(500).send(e);
            return;
        }
})