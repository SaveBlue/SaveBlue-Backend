import {Router} from 'express';
import authJWT from '../middlewares/authJWT.js';
import usersController from '../controllers/users.js';

const router = Router();

router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

// Return calling user data
router.get("/me", [authJWT.verifyTokenWhitelist], usersController.returnMe);

// Find user by ID
router.get("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenUser], usersController.findByID);

// Delete user by ID
router.delete("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenUser], usersController.remove);

// Update user by ID
router.put("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenUser], usersController.update);

router.use('/api/users', router);

export default router;
