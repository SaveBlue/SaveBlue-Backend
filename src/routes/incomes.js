const router = require("express").Router();
const authJWT = require("../middlewares/authJWT");
const drafts = require("../middlewares/drafts");
const incomesController = require("../controllers/incomes");
const categoriesIncomes = require("../models/incomes");


module.exports = incomesRouter => {

    incomesRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    // Return list of all available income categories
    router.get("/",[authJWT.verifyTokenWhitelist], (req, res) => {res.status(200).json(categoriesIncomes)});

    // Return all incomes of account by account ID - paginated
    router.get("/find/:aid",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccountOrDrafts], incomesController.findAllIncomesByAccountID);

    // Return an income by ID
    router.get("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome], incomesController.findIncomeByID);

    // Create income
    router.post("/", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpenseIncomePost, drafts.block], incomesController.create);

    // Delete income by ID
    router.delete("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome], incomesController.delete);

    // Update income by ID
    router.put("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome, drafts.block], incomesController.update);

    // Return income breakdown by primary categories
    router.get("/breakdown/:aid",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], incomesController.incomesBreakdown);

    incomesRouter.use('/api/incomes', router);
};
