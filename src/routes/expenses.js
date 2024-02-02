import {Router} from "express";
import authJWT from "../middlewares/authJWT.js";
import drafts from "../middlewares/drafts.js";
import expensesController from "../controllers/expenses.js";
import categoriesExpenses from "../models/expenses.js";
import {checkImageValidity} from "../middlewares/images.js";

const router = Router();

router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});


// Return list of all available expense categories
router.get("/", [authJWT.verifyTokenWhitelist], (req, res) => {
    res.status(200).json(categoriesExpenses)
});

// Return all expenses of account by account ID - paginated
router.get("/find/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccountOrDrafts], expensesController.findAllExpensesByAccountID);

// Return an expense by ID
router.get("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.findExpenseByID);

// Return an expense image by ID
router.get("/image/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.findExpenseImageByID);

// Create an expense
router.post("/", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpenseIncomePost, drafts.block, checkImageValidity ], expensesController.create);

// Delete an expense by ID
router.delete("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.remove);

// Update an expense by ID
router.put("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense, drafts.block], expensesController.update);

// Return expense breakdown by primary categories
router.get("/breakdown/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], expensesController.expensesBreakdown);

// Create sms expense draft
router.post("/sms", [authJWT.verifyTokenWhitelist, drafts.createExpenseSMS], expensesController.create);

// Upload image to expense


router.post('/image', [], );

router.use('/api/expenses', router);

export default router;