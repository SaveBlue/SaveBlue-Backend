const router = require("express").Router();
const authJWT = require("../middlewares/authJWT");
const accountsController = require("../controllers/accounts");


module.exports = accountsRouter => {

    accountsRouter.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    // Get all accounts of user by user ID
    router.get("/:uid",[authJWT.verifyTokenUser], accountsController.findAllAccountsByUserID);

    // Get all data of specific account by account ID
    router.get("/find/:id",[authJWT.verifyTokenAccount], accountsController.findAccountByID);

    // Delete specific account by account ID
    router.delete("/:id",[authJWT.verifyTokenAccount], accountsController.deleteAccountByID);

    // Update specific account's info by account ID
    // TODO: implement goals and budgets
    router.put("/:id",[authJWT.verifyTokenAccount], accountsController.updateAccountByID);

    // Create account of the user by user ID
    router.post("/:uid",[authJWT.verifyTokenUser], accountsController.createAccount);

    accountsRouter.use('/api/accounts', router);
};
