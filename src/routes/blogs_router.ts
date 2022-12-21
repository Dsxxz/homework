import { Router} from "express";
import {blogInputNameValidation, blogInputYoutubeURLValidation} from '../MiddleWares/input-blog-validation';
import {basicAuth} from "../MiddleWares/autorization";
import {inputBlogValidation} from "../MiddleWares/validation-middleware"
import {blogService} from "../domain/blog-service";
import {postsService} from "../domain/post-service";
import {postsRouter} from "./posts_router";
import {
    postBlogIDValidation, postBlogIDValidator,
    postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation
} from "../MiddleWares/input-post-validation";
import {BlogsType} from "../repositories/db";
export const blogsRouter = Router({});

blogsRouter.get('/', async (req,res)=>{
    const { pageNumber, pageSize, searchNameTerm, sortBy, sortDirection } = req.query

    const blogsArray = await blogService.findBlogs()
    res.status(200).send(blogsArray)
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
blogsRouter.post('/',basicAuth,blogInputNameValidation,blogInputYoutubeURLValidation,inputBlogValidation,async (req, res)=>{
    let newBlog=await blogService.createNewBlog(req.body.name, req.body.youtubeUrl)
    res.status(201).send(newBlog)
})
blogsRouter.put('/:id',basicAuth,blogInputNameValidation,blogInputYoutubeURLValidation,inputBlogValidation, async (req, res)=> {
    let findBlogById = await blogService.updateBlog(req.params.id, req.body.name, req.body.youtubeUrl)
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