import {Router} from "express";
import registerCheck from "../middlewares/registerCheck.js";
import authenticationController from "../controllers/authentication.js";
import authJWT from "../middlewares/authJWT.js";

const router = Router();
router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});


// Register new user
router.post("/register", [registerCheck.checkUniqueUsernameEmail], authenticationController.register);

// Login to user account
router.post("/login", authenticationController.login);

// Logout the user
router.post("/logout", [authJWT.verifyTokenWhitelist], authenticationController.logout);

router.use('/api/auth', router);

export default router;