const router = require("express").Router();
const authJWT = require("../middlewares/authJWT");
const expensesController = require("../controllers/expenses");


module.exports = expensesRouter => {

    expensesRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    // Get all expenses of account by account ID
    // TODO: limit the number of returned incomes
    router.get("/find/:aid",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], expensesController.findAllExpensesByAccountID);

    // Get an expense by ID
    router.get("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.findExpenseByID);

    // Create an expense
    router.post("/",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpenseIncomePost], expensesController.create);

    // Delete an expense by ID
    router.delete("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.delete);

    // Update an expense by ID
    router.put("/:id",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpense], expensesController.update);

    expensesRouter.use('/api/expenses', router);
};
