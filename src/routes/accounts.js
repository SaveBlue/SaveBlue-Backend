import {Router} from "express";
import authJWT from "../middlewares/authJWT.js";
import accountsController from "../controllers/accounts.js";

const router = Router();
router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});


// Get all accounts of user by user ID
router.get("/:uid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenUser], accountsController.findAllAccountsByUserID);

// Get all data of specific account by account ID
router.get("/find/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], accountsController.findAccountByID);

// Delete specific account by account ID
router.delete("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], accountsController.deleteAccountByID);

// Update specific account's info by account ID
// TODO: implement goals and budgets
router.put("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], accountsController.updateAccountByID);

// Create account of the user by user ID
router.post("/:uid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenUser], accountsController.createAccount);

// Get drafts account data of user by user ID
router.get("/drafts/:uid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenUser], accountsController.findDraftsAccountByUserID);

router.use('/api/accounts', router);

export default router;