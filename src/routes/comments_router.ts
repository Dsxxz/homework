import { Router,Request,Response} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {checkOwnerOfComments} from "../MiddleWares/checkOwnerOfComments";
import {CommentInputContentValidation} from "../MiddleWares/input-comment-validation";
import {inputCommentsValidation, inputLikesValidation} from "../MiddleWares/validation-middleware";

import {likeStatusValidation} from "../MiddleWares/likeStatus_check";
import {jwtService} from "../application/jwt-service";
import {ObjectId} from "mongodb";
import {likesService} from "../service/likes-service";
import {LikedCommentsType} from "../models/LikesInfoType";
export const commentsRouter = Router({});



commentsRouter.get('/:id',async (req:Request<{id:string}>,res:Response)=> {
    try {
        const findComment = await commentsRepository.getCommentById(req.params.id)
        if (!findComment) {
            res.sendStatus(404);
            return;
        }
        const token: string | undefined = req.headers.authorization?.toString().split(' ')[1]
        let userId: ObjectId | null
        if (token) {
            userId = await jwtService.verifyUserIdByAccessToken(token)
        } else {
            userId = null
        }
        let likes=[]
        let dislikes=[]
        let statusArr:LikedCommentsType|undefined
        let status: string= "None"
        const commentLikes: LikedCommentsType[] | null = await likesService.findCommentLikes(new ObjectId(req.params.id))
        if(commentLikes && commentLikes.length > 0){
             likes = commentLikes.filter(l => l.status === "Like")
             dislikes = commentLikes.filter(l => l.status === "Dislike")
             if(userId) {
                 statusArr = commentLikes.find(l => l.userId === userId)
                 if(statusArr){
                     status=statusArr.status
                 }
             }
        }
        console.log(likes.length, dislikes.length, status)
        res.status(200).send({
            id: findComment._id.toString(),
            commentatorInfo: findComment.commentatorInfo,
            content: findComment.content,
            createdAt: findComment.createdAt,
            likesInfo: {
                likesCount: likes.length,
                dislikesCount:dislikes.length,
                myStatus: status
            }
        })
        return;
    }catch (e){
        console.log("commentsRouter, get, id", e)
        res.status(500).send(e)
    }}
)
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
    await
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
    await likesService.deleteLike(new ObjectId(req.params.id))
    res.status(204).send(await commentsRepository.getCommentById(req.params.id));
    return;
})
commentsRouter.put('/:id/like-status',
    authMiddleWare,
    likeStatusValidation,
    inputLikesValidation,
    async (req:Request<{ id: string },{},{likeStatus:string}>,res:Response)=>{
        const findComment = await commentsRepository.getCommentById(req.params.id)
        if(!findComment) {
            res.sendStatus(404);
            return;
        }
        try {
            const token = req.headers.authorization!.split(' ')[1]
            const userId:ObjectId = await jwtService.verifyUserIdByAccessToken(token)
            await likesService.createOrUpdateLike(findComment._id, userId, "comment",req.body.likeStatus)
            res.sendStatus(204);
            return;
        }
        catch (e){
            console.log("comments-Router-put-comments.id.likeStatus", e)
            res.status(500).send(e);
            return;
        }
})