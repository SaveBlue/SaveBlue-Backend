const router = require("express").Router();
const authJWT = require("../middlewares/authJWT");
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


    // Get list of all available income categories
    router.get("/",[authJWT.verifyTokenWhitelist], (req, res) => {res.status(200).json(categoriesIncomes)});

    // Get all incomes of account by account ID
    // TODO: limit the number of returned incomes
    router.get("/find/:aid",[authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], incomesController.findAllIncomesByAccountID);

    // Get an income by ID
    router.get("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome], incomesController.findIncomeByID);

    // Create income
    router.post("/", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenExpenseIncomePost], incomesController.create);

    // Delete income by ID
    router.delete("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome], incomesController.delete);

    // Update income by ID
    router.put("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenIncome], incomesController.update);

    incomesRouter.use('/api/incomes', router);
};
