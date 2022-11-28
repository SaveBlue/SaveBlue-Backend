const router = require("express").Router();
const authJWT = require("../middlewares/authJWT");
const drafts = require("../middlewares/drafts");
const expensesController = require("../controllers/expenses");
const categoriesExpenses = require("../models/expenses")


module.exports = expensesRouter => {

    expensesRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    // Return list of all available expense categories
    router.get("/",[authJWT.verifyTokenWhitelist], (req, res) => {res.status(200).json(categoriesExpenses)});

    // Return all expenses of account by account ID - paginated
    router.get("/find/:aid",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccountOrDrafts], expensesController.findAllExpensesByAccountID);

    // Return an expense by ID
    router.get("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.findExpenseByID);

    // Create an expense
    router.post("/",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpenseIncomePost, drafts.block], expensesController.create);

    // Delete an expense by ID
    router.delete("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.delete);

    // Update an expense by ID
    router.put("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense, drafts.block], expensesController.update);

    // Return expense breakdown by primary categories
    router.get("/breakdown/:aid",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], expensesController.expensesBreakdown);

    // Create sms expense draft
    router.post("/sms",[authJWT.verifyTokenWhitelist, drafts.createExpenseSMS], expensesController.create);

    expensesRouter.use('/api/expenses', router);
};
