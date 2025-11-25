import { body } from "express-validator";

export const validateRegistration = [
    body('role')
        .trim()
        .isIn(['user','organizer'])
        .withMessage("Role must be either 'user' or 'organizer' "),
    
    body("email")
        .trim()
        .isEmail()
        .withMessage("Enter a valid email"),

    body("password")
        .isLength({min: 6})
        .withMessage("Password must be at least 6 characters"),

    body("fullName")
        .if(body("role").equals("user"))
        .notEmpty()
        .withMessage("username is required for normal users"),

    body("organizationName")
        .if(body("role").equals("organizer"))
        .notEmpty()
        .withMessage("Location is required for organizers"),

    body("country")
        .trim()
        .notEmpty()
        .withMessage("Country is required")
    
]