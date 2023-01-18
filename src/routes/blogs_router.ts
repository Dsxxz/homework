import { Router,Request,Response} from "express";
import {blogInputNameValidation, blogInputWebsiteUrlValidation} from '../MiddleWares/input-blog-validation';
import {basicAuth} from "../MiddleWares/autorization";
import {inputBlogValidation} from "../MiddleWares/validation-middleware"
import {blogService} from "../domain/blog-service";
import {postsService} from "../domain/post-service";
import {
  // postBlogIDValidation, postBlogIDValidator,
    postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation
} from "../MiddleWares/input-post-validation";
import {BlogType, PostType} from "../repositories/db";
import {blogQueryService, paginationType, postQueryService, QueryInputType} from "../domain/query-service";
export const blogsRouter = Router({});

blogsRouter.get('/',async (req:Request<{},{},{},QueryInputType>,res:Response)=>{
            try{
                const { pageNumber=1, pageSize=10, sortBy, sortDirections, searchNameTerm} = req.query;

                const blogs: Array<BlogType> = await blogQueryService.findBlogsByQuerySort( sortBy?.toString(),
                    sortDirections?.toString(),searchNameTerm?.toString(),+pageNumber?.toString(),+pageSize?.toString())
                const paginator:paginationType = await blogQueryService.paginationPage(searchNameTerm,+pageNumber,+pageSize)

                res.status(200).send({
                    "pagesCount": paginator.pagesCount,
                    "page": +pageNumber,
                    "pageSize": +pageSize,
                    "totalCount": paginator.totalCount,
                    "items": blogs
                })
            }
                catch (e){
                    res.sendStatus(404)
                }
})
blogsRouter.get('/:id',async (req,res)=>{
    let foundBlogById = await blogService.findBlogById(req.params.id)
    if(foundBlogById){
        res.status(200).send(foundBlogById)
    }
    else{
        res.sendStatus(404)
    }
})
blogsRouter.post('/',basicAuth,blogInputNameValidation,blogInputWebsiteUrlValidation,inputBlogValidation,async (req, res)=>{
    try{
        let newBlog = await blogService.createNewBlog(req.body.name, req.body.websiteUrl, req.body.description)
        res.status(201).send(newBlog)
    }
    catch (e) {
        res.sendStatus(404)
    }
})
blogsRouter.put('/:id',basicAuth,blogInputNameValidation,blogInputWebsiteUrlValidation,inputBlogValidation, async (req, res)=> {
    let findBlogById = await blogService.updateBlog(req.params.id, req.body.name, req.body.websiteUrl,req.body.description)
    if (findBlogById) {
        res.sendStatus(204)
    }
    else{
        res.sendStatus(404)
    }
})
blogsRouter.delete('/:id',basicAuth, async (req,res)=>{
    let foundBlogById = await blogService.deleteBlog(req.params.id)
    if(foundBlogById){
        res.sendStatus(204)
    }
    else{
        res.sendStatus(404)
    }
})
blogsRouter.post('/:blogId/posts',basicAuth,postTitleValidation, postShortDescriptionValidation,
    postContentValidation, inputBlogValidation,async (req, res)=> {
        let newPost = await postsService.createNewPost(req.body.title, req.body.shortDescription,
            req.body.content, req.params.blogId)

        if (newPost) {
            res.status(201).send( newPost);
        } else {
            res.sendStatus(404);
        }
    })
blogsRouter.get('/:blogId/posts',async (req:Request<{blogId:string},{},{},QueryInputType>,res:Response)=> {
    let foundBlogById:BlogType | null = await blogService.findBlogById(req.params.blogId)
    if(!foundBlogById){
        res.sendStatus(404)
    }
    else{
    try{
        const { pageNumber=1, pageSize=10, sortBy, sortDirections} = req.query;

        const posts: Array<PostType> = await postQueryService.findPostsByQuerySort( sortBy?.toString(),
            sortDirections?.toString(),+pageNumber?.toString(),+pageSize?.toString(),req.params.blogId!)
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
    }}
})