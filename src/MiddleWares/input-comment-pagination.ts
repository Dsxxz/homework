const {body} = require('express-validator');

export const CommentInputValidation = body('content').trim().isLength({min:20, max:300})
    .withMessage('content should be from 20 to 300 symbols')




