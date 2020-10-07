const authJWT = require("../middlewares/authJWT");
module.exports = accountsRouter => {

    accountsRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    const accountsController = require("../controllers/accounts");
    const router = require("express").Router();

    // Get all accounts of user by user ID
    router.get("/:uid",[authJWT.verifyTokenUser], accountsController.findAllAccountsByUserID);

    // Get all data of specific account by account ID
    router.get("/find/:id",[authJWT.verifyTokenAccount], accountsController.findAccountByID);

    // Delete specific account by account ID
    // TODO: fetch all incomes and expenses for the account and delete them
    router.delete("/:id",[authJWT.verifyTokenAccount], accountsController.deleteAccountByID);

    // Update specific account's info by account ID
    // TODO: think about goals and budgets
    router.put("/:id",[authJWT.verifyTokenAccount], accountsController.updateAccountByID);

    // Create account to user by user ID
    router.post("/:uid",[authJWT.verifyTokenUser], accountsController.createAccount);

    accountsRouter.use('/api/accounts', router);
};
