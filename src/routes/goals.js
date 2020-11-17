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
    router.get("/:aid", [authJWT.verifyTokenAccount], goalsController.findAllGoals);

    // Find account goal by ID
    router.get("/find/:id", [authJWT.verifyTokenGoal], goalsController.findGoalByID);

    // Create account goal
    router.post("/:aid", [authJWT.verifyTokenAccount], goalsController.create);

    // Delete account goal by ID
    router.delete("/:id", [authJWT.verifyTokenGoal], goalsController.delete);

    // Update account goal by ID
    router.put("/:id", [authJWT.verifyTokenGoal], goalsController.update);

    // Add to goal currentAmount
    router.put("/currentAmount/:id", [authJWT.verifyTokenGoal], goalsController.updateGoalCurrentAmount);

    goalsRouter.use('/api/goals', router);
};
