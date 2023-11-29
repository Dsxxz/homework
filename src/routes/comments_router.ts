import { Router,Request,Response} from "express";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {checkOwnerOfComments} from "../MiddleWares/checkOwnerOfComments";
import {CommentInputContentValidation} from "../MiddleWares/input-comment-validation";
import {inputCommentsValidation, inputLikesValidation} from "../MiddleWares/validation-middleware";

import {likeStatusValidation} from "../MiddleWares/likeStatus_check";
import {jwtService} from "../application/jwt-service";
import {ObjectId} from "mongodb";
import {LikeService} from "../service/likes-service";
export const commentsRouter = Router({});



commentsRouter.get('/:id',async (req:Request<{id:string}>,res:Response)=> {
        const findComment = await commentsRepository.getCommentById(req.params.id)
        if (!findComment) {
            res.sendStatus(404);
            return;
        }
        const token:string|undefined = req.headers.authorization?.toString().split(' ')[1]
        let userId: ObjectId | null
        if (token) {
            userId = await jwtService.verifyUserIdByAccessToken(token)
        } else {
            userId = null
        }

        const likesArray =  await LikeService.getLikeStatus(userId)
        const myStatus = likesArray?.find(l=>l.commentsId===findComment._id).status||[]
    console.log('myStatus,commentsRouter.get/:id',myStatus)
        const {likes, dislikes} = await LikeService.getLikesCounter(findComment._id)

    if (userId) {
        res.status(200).send({
            id: findComment._id.toString(),
            commentatorInfo: findComment.commentatorInfo,
            content: findComment.content,
            createdAt: findComment.createdAt,
            likesInfo: {
                likesCount: likes,
                dislikesCount: dislikes,
                myStatus: myStatus
            }
        })
        return;

    }
    else {res.status(200).send({
        id: findComment._id.toString(),
        commentatorInfo: findComment.commentatorInfo,
        content: findComment.content,
        createdAt: findComment.createdAt,
        likesInfo: {
            likesCount: likes,
            dislikesCount: dislikes,
            myStatus: 'None'
        }
    })
        return;
    }
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
        if(!findComment) {
            res.sendStatus(404);
            return;
        }
        try {
            const token = req.headers.authorization!.split(' ')[1]
            const userId:ObjectId = await jwtService.verifyUserIdByAccessToken(token)
            await LikeService.updateCommentLike(userId,req.body.likeStatus,findComment._id)
            res.sendStatus(204);
            return;
        }
        catch (e){
            console.log("comments-Router-put-comments.id.likeStatus", e)
            res.status(500).send(e);
            return;
        }
})