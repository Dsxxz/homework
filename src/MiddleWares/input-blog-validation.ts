const {body} = require('express-validator');

export const blogInputNameValidation = body('name').trim().isLength({min:3, max:15}).withMessage('Blog name should be from 3 to 15 symbols')

const regex= new RegExp('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$')

export const blogInputYoutubeURLValidation = body('youtubeUrl').trim().isLength({min:3, max:100}).withMessage('YoutubeUrl should be from 3 to 100 symbols')
    .matches(regex).withMessage('YoutubeUrl incorrect')


