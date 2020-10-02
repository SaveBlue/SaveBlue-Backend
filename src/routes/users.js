const authJWT = require("../middlewares/authJWT");
module.exports = usersRouter => {

    usersRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    const usersController = require("../controllers/users");
    const router = require("express").Router();

    // Find user by ID
    router.get("/:id", [authJWT.verifyTokenUser], usersController.findByID);

    // Delete user by ID
    // TODO: fetch all incomes and expenses with the user id and delete them
    router.delete("/:id", [authJWT.verifyTokenUser], usersController.delete);

    // Update user by ID
    router.put("/:id", [authJWT.verifyTokenUser], usersController.update);

    usersRouter.use('/api/users', router);
};
