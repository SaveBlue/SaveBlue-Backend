import {Router} from "express";
import authJWT from "../middlewares/authJWT.js";
import goalsController from "../controllers/goals.js";

const router = Router();

router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

// Find all account goals
router.get("/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], goalsController.findAllGoals);

// Find account goal by ID
router.get("/find/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenGoal], goalsController.findGoalByID);

// Create account goal
router.post("/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], goalsController.create);

// Delete account goal by ID
router.delete("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenGoal], goalsController.remove);

// Update account goal by ID
router.put("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenGoal], goalsController.update);

// Add to goal currentAmount
router.put("/currentAmountChange/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenGoal], goalsController.updateGoalCurrentAmount);

// Complete goal
router.put("/complete/:id", [authJWT.verifyTokenGoal], goalsController.completeGoal);

router.use('/api/goals', router);

export default router;