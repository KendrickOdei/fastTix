import { validationResult } from "express-validator";

import {Request,Response,NextFunction} from 'express'

export const handleValidation = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()){
     res.status(422).json({
            message: 'Validation failed',
            errors: errors.array(),
        })

    return;
    }
    next()
}