const {body} = require('express-validator');

export const CommentInputValidation = body('content').isString().withMessage('content should be string')
    .trim().exists({checkFalsy: true}).withMessage('Title should exist').bail().isLength({min:20, max:300})
    .withMessage('content should be from 20 to 300 symbols').bail()




