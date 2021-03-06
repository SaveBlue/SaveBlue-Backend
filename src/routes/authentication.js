const router = require("express").Router();
const registerCheck = require("../middlewares/registerCheck")
const authenticationController = require("../controllers/authentication");
const authJWT = require("../middlewares/authJWT");



module.exports = authenticationRouter => {

    authenticationRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    // Register new user
    router.post("/register",[registerCheck.checkUniqueUsernameEmail], authenticationController.register);

    // Login to user account
    router.post("/login", authenticationController.login);

    // Logout the user
    router.post("/logout", [authJWT.verifyTokenWhitelist], authenticationController.logout);

    authenticationRouter.use('/api/auth', router);
}
