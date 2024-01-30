import {blogService} from "../service/blog-service";

const {body } = require('express-validator');


export const postTitleValidation = body('title').trim().exists({checkFalsy: true}).withMessage('Title should exist').bail()
    .isLength({min: 3, max:30}).withMessage('Title length should be from 3 to 30 symbols').bail()

export const postShortDescriptionValidation =body('shortDescription').trim().exists({checkFalsy: true})
    .withMessage('ShortDescription should exist').bail()
    .isLength({min: 3, max:100}).withMessage('ShortDescription length should be from 3 to 100 symbols').bail()


export const postContentValidation =body('content').trim().exists({checkFalsy: true}).withMessage('Content should exist').bail()
    .isLength({min: 3, max:1000}).withMessage('Content length should be from 3 to 1000 symbols').bail()


export const postBlogIDValidation = body('blogId').trim().exists({checkFalsy: true}).withMessage('BlogId is required')
    .bail()


export const postBlogIDValidator = body('blogId').trim().custom( async ( value: string)=> {
    const existingBlog = await blogService.findBlogById(value)
    if(!existingBlog){
        throw new Error('blogID doesnt exist')
    }
    else{
        return true;
    }
})
