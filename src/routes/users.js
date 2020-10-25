const router = require("express").Router();
const authJWT = require("../middlewares/authJWT");
const usersController = require("../controllers/users");


module.exports = usersRouter => {

    usersRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    // Find user by ID
    router.get("/:id", [authJWT.verifyTokenUser], usersController.findByID);

    // Delete user by ID
    router.delete("/:id", [authJWT.verifyTokenUser], usersController.delete);

    // Update user by ID
    router.put("/:id", [authJWT.verifyTokenUser], usersController.update);

    usersRouter.use('/api/users', router);
};
