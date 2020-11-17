const router = require("express").Router();
const authJWT = require("../middlewares/authJWT");
const goalsController = require("../controllers/goals");


module.exports = goalsRouter => {

    goalsRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    // Find all account goals
    router.get("/:aid", /*[authJWT.verifyTokenUser],*/ goalsController.findAllGoals);

    // Find account goal by ID
    router.get("/find/:id", /*[authJWT.verifyTokenUser],*/ goalsController.findGoalByID);

    // Create account goal
    router.post("/:aid", /*[authJWT.verifyTokenUser],*/ goalsController.create);

    // Delete account goal by ID
    router.delete("/:id", /*[authJWT.verifyTokenUser],*/ goalsController.delete);

    // Update account goal by ID
    router.put("/:id", /*[authJWT.verifyTokenUser],*/ goalsController.update);

    goalsRouter.use('/api/goals', router);
};
