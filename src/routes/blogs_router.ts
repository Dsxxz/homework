import { Router,Request,Response} from "express";
import {blogInputNameValidation, blogInputWebsiteUrlValidation} from '../MiddleWares/input-blog-validation';
import {basicAuth} from "../MiddleWares/autorization";
import {inputBlogsAndPostsValidation} from "../MiddleWares/validation-middleware"
import {blogService} from "../service/blog-service";
import {postsService} from "../service/post-service";
import {postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation} from "../MiddleWares/input-post-validation";
import {blogQueryService, postQueryService} from "../service/query-service";
import {BlogType} from "../models/blogs-types";
import {PostType} from "../models/posts-types";
import {paginationType, QueryInputBlogAndPostType} from "../models/query_input_models";
export const blogsRouter = Router({});

blogsRouter.get('/',async (req:Request<{},{},{},QueryInputBlogAndPostType>,res:Response)=>{
            try{
                const { pageNumber=1, pageSize=10, sortBy, sortDirection, searchNameTerm} = req.query;

                const blogs: Array<BlogType> = await blogQueryService.findBlogsByQuerySort( sortBy?.toString(),
                    sortDirection?.toString(),searchNameTerm?.toString(),+pageNumber?.toString(),+pageSize?.toString())
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
blogsRouter.post('/',basicAuth,blogInputNameValidation,blogInputWebsiteUrlValidation,inputBlogsAndPostsValidation,async (req, res)=>{
    try{
        let newBlog = await blogService.createNewBlog(req.body.name, req.body.websiteUrl, req.body.description)
        res.status(201).send(newBlog)
    }
    catch (e) {
        res.sendStatus(404)
    }
})
blogsRouter.put('/:id',basicAuth,blogInputNameValidation,blogInputWebsiteUrlValidation,inputBlogsAndPostsValidation, async (req, res)=> {
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
    postContentValidation, inputBlogsAndPostsValidation,async (req, res)=> {
        let newPost = await postsService.createNewPost(req.body.title, req.body.shortDescription,
            req.body.content, req.params.blogId)

        if (newPost) {
            res.status(201).send( newPost);
        } else {
            res.sendStatus(404);
        }
    })
blogsRouter.get('/:blogId/posts',async (req:Request<{blogId:string},{},{},QueryInputBlogAndPostType>,res:Response)=> {
    let foundBlogById:BlogType | null = await blogService.findBlogById(req.params.blogId)
    if(!foundBlogById){
        res.sendStatus(404)
    }
    else{
    try{
        const { pageNumber=1, pageSize=10, sortBy, sortDirection} = req.query;


        const posts: Array<PostType> = await postQueryService.findPostsByQuerySort( sortBy?.toString(),
            sortDirection?.toString(),+pageNumber?.toString(),+pageSize?.toString(),req.params.blogId!)
        const paginator:paginationType = await postQueryService.paginationPage(+pageNumber,+pageSize,req.params.blogId!)
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