const router = require("express").Router();
const authJWT = require("../middlewares/authJWT");
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
    router.get("/find/:aid",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], expensesController.findAllExpensesByAccountID);

    // Return an expense by ID
    router.get("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.findExpenseByID);

    // Create an expense
    router.post("/",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpenseIncomePost], expensesController.create);

    // Delete an expense by ID
    router.delete("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.delete);

    // Update an expense by ID
    router.put("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.update);

    // Return expense breakdown by primary categories
    router.get("/breakdown/:aid",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], expensesController.expensesBreakdown);

    expensesRouter.use('/api/expenses', router);
};
