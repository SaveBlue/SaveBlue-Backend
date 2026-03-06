import { Router } from "express";
import authJWT from "../middlewares/authJWT.js";
import investmentsController from "../controllers/investments.js";
import { investmentAssetTypes, investmentActions } from "../models/investments.js";

const router = Router();

router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

// Return list of all available investment asset types and actions
router.get("/types", [authJWT.verifyTokenWhitelist], (req, res) => {
    res.status(200).json({ assetTypes: investmentAssetTypes, actions: investmentActions })
});

// Return all investment events for an account — paginated
router.get("/find/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], investmentsController.findAllEventsByAccountID);

// Return all positions for an account
router.get("/positions/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], investmentsController.findPositionsByAccountID);

// Return portfolio breakdown by asset type for an account
router.get("/breakdown/:aid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenAccount], investmentsController.positionsBreakdown);

// Return all events for a specific position — paginated
router.get("/events/:pid", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentPosition], investmentsController.findEventsByPositionID);

// Return a single position by ID
router.get("/position/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentPosition], investmentsController.findPositionByID);

// Return a single investment event by ID
router.get("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentEvent], investmentsController.findEventByID);

// Create investment event (BUY, SELL, YIELD)
router.post("/", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentPost], investmentsController.create);

// Update position price
router.put("/position/price/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentPosition], investmentsController.updatePositionPrice);

// Update position display info (assetName, symbol, assetType)
router.put("/position/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentPosition], investmentsController.updatePositionInfo);

// Update event display info (description, date)
router.put("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentEvent], investmentsController.updateEventInfo);

// Delete an entire position and all its events
router.delete("/position/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentPosition], investmentsController.removePosition);

// Delete latest investment event (undo)
router.delete("/:id", [authJWT.verifyTokenWhitelist, authJWT.verifyTokenInvestmentEvent], investmentsController.removeLatestEvent);

router.use('/api/investments', router);

export default router;
