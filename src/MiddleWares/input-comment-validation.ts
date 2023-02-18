const {body} = require('express-validator');

export const CommentInputContentValidation = body('content').isString().trim().withMessage('content should be string')
    .exists({checkFalsy: true}).withMessage('Title should exist').bail().isLength({min:20, max:300})
    .withMessage('content should be from 20 to 300 symbols').bail()




