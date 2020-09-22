const registerCheck = require("../middlewares/registerCheck")
module.exports = authenticationRouter => {

    authenticationRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    const authenticationController = require("../controllers/authentication");
    const router = require("express").Router();

    // Register new user
    router.post("/register",[registerCheck.checkUniqueUsernameEmail], authenticationController.register);

    // Login to user account
    router.post("/login",authenticationController.login);


    authenticationRouter.use('/api/auth', router);
}
