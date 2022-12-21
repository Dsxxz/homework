import {Router} from "express";
import {inputBlogValidation} from "../middleWares/validation-middleware"
import {
    postBlogIDValidation, postBlogIDValidator,
    postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation
} from "../middleWares/input-post-validation"
import {basicAuth} from "../middleWares/Authorization";
import {postsService} from "../domain/posts-service";
export const postsRouter=Router({});


postsRouter.get('/', async (req,res)=>{
    const postsArray = await postsService.findPosts()
    res.status(200).send(postsArray)
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
