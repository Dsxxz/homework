import {Request, Response, Router} from "express";
import {inputCommentsValidation, inputBlogsAndPostsValidation} from "../MiddleWares/validation-middleware"
import {
    postBlogIDValidation, postBlogIDValidator,
    postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation
} from "../MiddleWares/input-post-validation"
import {basicAuth} from "../MiddleWares/admin_basic_autorization";
import {postsService} from "../service/post-service";
import {commentsQueryService, postQueryService} from "../service/query-service";
import {PostType} from "../models/posts-types";
import {commentsRepository} from "../repositories/comments_in_db_repository";
import {paginationType, QueryInputBlogAndPostType, QueryInputCommentsType} from "../models/query_input_models";
import {CommentsViewType} from "../models/comments-types";
import {CommentInputContentValidation} from "../MiddleWares/input-comment-validation";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {ObjectId} from "mongodb";
import {jwtService} from "../application/jwt-service";
export const postsRouter=Router({});


postsRouter.get('/', async (req:Request<{},{},{},QueryInputBlogAndPostType>,res:Response)=>{
    try{
        const { pageNumber=1, pageSize=10, sortBy, sortDirection} = req.query;

        const posts: Array<PostType> = await postQueryService.findPostsByQuerySort( sortBy?.toString(),
            sortDirection?.toString(),+pageNumber?.toString(),+pageSize?.toString())
        const paginator:paginationType = await postQueryService.paginationPage(+pageNumber,+pageSize)
        res.status(200).send({
            "pagesCount": paginator.pagesCount,
            "page": +pageNumber,
            "pageSize": +pageSize,
            "totalCount": paginator.totalCount,
            "items": posts
        })
    }
    catch (e){
        res.sendStatus(404)
    }
})
postsRouter.get('/:id',async (req,res)=>{
    let foundPostById = await postsService.findPostById(req.params.id)
    if(foundPostById){
        res.status(200).send(foundPostById)
    }
    else{
        res.sendStatus(404)
    }
})
postsRouter.post('/',basicAuth,postTitleValidation,postShortDescriptionValidation,postContentValidation,
    postBlogIDValidation,postBlogIDValidator, inputBlogsAndPostsValidation,async (req:Request, res:Response)=>{
        let newPost = await  postsService.createNewPost(req.body.title, req.body.shortDescription,
            req.body.content, req.body.blogId)

        if(newPost) {
            res.status(201).send(newPost);
        }
        else{
            res.sendStatus(400);
        }
    })
postsRouter.post('/:id/comments',
    CommentInputContentValidation,
    authMiddleWare,
    inputCommentsValidation,
    async (req:Request<{id: string}, {}, {content: string}>, res:Response)=>{
      try {
          const postId = req.params.id;
          const content = req.body.content;
          const userId = new ObjectId(req.user?._id);
          const foundPostById = await postsService.findPostById(postId)
          if (!foundPostById) {
              res.sendStatus(404);
              return;
          }
              const newComment: CommentsViewType | null = await commentsRepository.createComment
              (content,
                  userId,
                  foundPostById.id)
              res.status(201).send(newComment);
              return;
          } catch (e) {
              console.log("postsRouter.post('/:id/comments'", e)
              res.status(500).send(e)
              return;
          }
    })
postsRouter.get('/:id/comments',async (req:Request<{id:string},{},{},QueryInputCommentsType>,res:Response)=>{
    let foundPostById = await postsService.findPostById(req.params.id)
    if(!foundPostById){
        res.sendStatus(404);
        return;
    }
    try{
        const token = req.headers.authorization?.toString().split(' ')[1]
        let userId: ObjectId | null
        if (token) {
            userId = await jwtService.verifyUserIdByAccessToken(token)
        }
        else{  userId = null}
        const { pageNumber=1, pageSize=10, sortBy, sortDirection} = req.query;
        const comments = await  commentsQueryService.getCommentsForPost( sortBy?.toString(),
            sortDirection?.toString(), req.params.id, +pageNumber, +pageSize, userId)
        const paginator:paginationType = await commentsQueryService.paginationPage(+pageNumber,+pageSize, req.params.id)
        res.status(200).send({
            "pagesCount": paginator.pagesCount,
            "page": +pageNumber,
            "pageSize": +pageSize,
            "totalCount": paginator.totalCount,
            "items": comments
        })
        return;
    }
    catch (e){
        res.sendStatus(404)
        return;
    }
})
postsRouter.put('/:id',basicAuth,postShortDescriptionValidation,postTitleValidation,postContentValidation,
    postBlogIDValidation, postBlogIDValidator, inputBlogsAndPostsValidation,async (req, res)=> {
        let findPostById = await postsService.updatePost(req.params.id, req.body.title, req.body.shortDescription,
            req.body.content, req.body.blogId)
        if (findPostById) {
            res.sendStatus(204)
        }
        else{
            res.sendStatus(404)
        }
    })
postsRouter.delete('/:id',basicAuth, async (req,res)=>{
    let foundPostById = await postsService.deletePost(req.params.id)
    if(foundPostById){
        res.sendStatus(204)
    }
    else{
        res.sendStatus(404)
    }
})
