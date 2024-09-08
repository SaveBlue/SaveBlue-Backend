import {Router} from "express";
import authJWT from "../middlewares/authJWT.js";
import drafts from "../middlewares/drafts.js";
import incomesController from "../controllers/incomes.js";
import categoriesIncomes from "../models/incomes.js";

const router = Router();

router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

// Return list of all available income categories
router.get("/", [authJWT.verifyTokenWhitelist], (req, res) => {
    res.status(200).json(categoriesIncomes)
});

// Return all incomes of account by account ID - paginated
router.get("/find/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccountOrDrafts], incomesController.findAllIncomesByAccountID);

// Return an income by ID
router.get("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome], incomesController.findIncomeByID);

// Create income
router.post("/", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpenseIncomePost, drafts.block], incomesController.create);

// Delete income by ID
router.delete("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome], incomesController.remove);

// Update income by ID
router.put("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome, drafts.block], incomesController.update);

// Return income breakdown by primary categories
router.get("/breakdown/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], incomesController.incomesBreakdown);

router.use('/api/incomes', router);

export default router;
