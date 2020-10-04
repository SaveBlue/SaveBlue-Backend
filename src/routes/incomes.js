const authJWT = require("../middlewares/authJWT");
module.exports = incomesRouter => {

    incomesRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    const incomesController = require("../controllers/incomes");
    const router = require("express").Router();

    // Get all incomes of account by account ID
    // TODO: limit the number of returned incomes
    router.get("/find/:aid",[authJWT.verifyTokenAccount], incomesController.findAllIncomesByAccountID);

    // Get an income by ID
    router.get("/:id", [authJWT.verifyTokenIncome], incomesController.findIncomeByID);

    // Create income
    // TODO: middleware balance change
    router.post("/", [authJWT.verifyTokenExpenseIncomePost], incomesController.create);

    // Delete income by ID
    // TODO: middleware balance change
    router.delete("/:id", [authJWT.verifyTokenIncome], incomesController.delete);

    // Update income by ID
    // TODO: handle account changes (add to new acc, substract from old acc), middleware balance change
    router.put("/:id", [authJWT.verifyTokenIncome], incomesController.update);

    incomesRouter.use('/api/incomes', router);
};
