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
import {BlogType} from "../repositories/db";
import {blogQueryService, paginationType, QueryInputBlogsType} from "../domain/query-service";
export const blogsRouter = Router({});

blogsRouter.get('/', async (req:Request<{},{},{},QueryInputBlogsType>,res:Response)=>{
            try{
                const { pageNumber, pageSize, sortBy, sortDirections, searchNameTerm} = req.query;

                const blog: Array<BlogType> = await blogQueryService.findBlogsByQuerySort( sortBy?.toString(),
                    sortDirections?.toString(),searchNameTerm?.toString(),+pageNumber?.toString(),+pageSize?.toString())
                const paginator:paginationType = await blogQueryService.paginationPage(searchNameTerm,+pageNumber,+pageSize)
                res.status(200).send({
                    "pagesCount": paginator.pagesCount,
                    "page": pageNumber,
                    "pageSize": pageSize,
                    "totalCount": paginator.totalCount,
                    "items": blog
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
    let newBlog=await blogService.createNewBlog(req.body.name, req.body.websiteUrl, req.body.description)
    res.status(201).send(newBlog)
})
blogsRouter.put('/:id',basicAuth,blogInputNameValidation,blogInputWebsiteUrlValidation,inputBlogValidation, async (req, res)=> {
    let findBlogById = await blogService.updateBlog(req.params.id, req.body.name, req.body.youtubeUrl,req.body.description)
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
            res.sendStatus(400);
        }
    })
blogsRouter.get('/:blogId/posts',async (req, res)=> {
    const postsArray = await postsService.findPosts()
    res.status(200).send(postsArray)
})