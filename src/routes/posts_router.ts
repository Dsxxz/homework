import {Request, Response, Router} from "express";
import {inputBlogValidation} from "../MiddleWares/validation-middleware"
import {
    postBlogIDValidation, postBlogIDValidator,
    postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation
} from "../MiddleWares/input-post-validation"
import {basicAuth} from "../MiddleWares/autorization";
import {postsService} from "../service/post-service";
import {PostType} from "../repositories/db";
import {paginationType, postQueryService, QueryInputType} from "../service/query-service";
export const postsRouter=Router({});


postsRouter.get('/', async (req:Request<{},{},{},QueryInputType>,res:Response)=>{
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
    postBlogIDValidation,postBlogIDValidator, inputBlogValidation,async (req, res)=>{
        let newPost = await  postsService.createNewPost(req.body.title, req.body.shortDescription,
            req.body.content, req.body.blogId)

        if(newPost) {
            res.status(201).send(newPost);
        }
        else{
            res.sendStatus(400);
        }
    })
postsRouter.put('/:id',basicAuth,postShortDescriptionValidation,postTitleValidation,postContentValidation,
    postBlogIDValidation, postBlogIDValidator, inputBlogValidation,async (req, res)=> {
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
