import mongoose from 'mongoose';
import updateAccountBalances from '../services/updateAccountBalances.js';

const InvestmentPosition = mongoose.model('InvestmentPosition');
const InvestmentEvent = mongoose.model('InvestmentEvent');

// Find all investment events for an account — paginated
const findAllEventsByAccountID = async (req, res) => {
    try {
        const page = req.query.page || 0;
        const eventsPerPage = 16;

        const events = await InvestmentEvent
            .find({ accountID: req.params.aid })
            .sort({ date: -1, _id: -1 })
            .skip(eventsPerPage * page)
            .limit(eventsPerPage);

        res.status(200).json(events);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching investment events!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Find all open positions for an account
const findPositionsByAccountID = async (req, res) => {
    try {
        const includeClosed = !!req.query.closed;

        const filter = { accountID: req.params.aid };
        if (!includeClosed) {
            filter.closed = false;
        }

        const positions = await InvestmentPosition
            .find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json(positions);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching investment positions!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Find a single investment event by ID
const findEventByID = async (req, res) => {
    try {
        const event = await InvestmentEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "No investment event with selected ID!"
            });
        }

        res.status(200).json(event);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching the investment event!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Find all events for a specific position — paginated
const findEventsByPositionID = async (req, res) => {
    try {
        const page = req.query.page || 0;
        const eventsPerPage = 16;

        const events = await InvestmentEvent
            .find({ positionID: req.params.pid })
            .sort({ date: -1, _id: -1 })
            .skip(eventsPerPage * page)
            .limit(eventsPerPage);

        res.status(200).json(events);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching position events!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Find a single position by ID
const findPositionByID = async (req, res) => {
    try {
        const position = await InvestmentPosition.findById(req.params.id);

        if (!position) {
            return res.status(404).json({
                message: "No investment position with selected ID!"
            });
        }

        res.status(200).json(position);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching the investment position!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Create an investment event (BUY, SELL, YIELD)
const create = async (req, res) => {

    const { userID, accountID, positionID, action, assetType, assetName, symbol, description, date, units, unitPriceAmount, feeAmount } = req.body;

    if (!["BUY", "SELL", "YIELD"].includes(action)) {
        return res.status(400).json({ message: "Invalid action." });
    }

    if (description?.length > 32) {
        return res.status(400).json({ message: "Description too long." });
    }

    // SELL and YIELD always require an existing position
    if ((action === "SELL" || action === "YIELD") && !positionID) {
        return res.status(400).json({ message: "positionID is required for SELL and YIELD." });
    }

    try {
        if (action === "BUY") {
            await handleBuy({ userID, accountID, positionID, assetType, assetName, symbol, description, date, units, unitPriceAmount, feeAmount }, res);
        } else if (action === "SELL") {
            await handleSell({ userID, accountID, positionID, description, date, units, unitPriceAmount, feeAmount }, res);
        } else if (action === "YIELD") {
            await handleYield({ userID, accountID, positionID, description, date, unitPriceAmount, feeAmount }, res);
        }
    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while creating investment event!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


const handleBuy = async (params, res) => {
    const { userID, accountID, positionID, assetType, assetName, symbol, description, date, units, unitPriceAmount, feeAmount } = params;

    if (!units || units <= 0) {
        return res.status(400).json({ message: "Units must be greater than 0." });
    }
    if (!unitPriceAmount || !Number.isSafeInteger(unitPriceAmount) || unitPriceAmount <= 0) {
        return res.status(400).json({ message: "Unit price not a valid number." });
    }

    const cost = Math.ceil(units * unitPriceAmount);
    const fee = Math.ceil(feeAmount || 0);

    let position;

    if (positionID) {
        // Add to existing position (DCA)
        position = await InvestmentPosition.findById(positionID);

        if (!position) {
            return res.status(404).json({ message: "No position with selected ID!" });
        }
        if (position.closed) {
            return res.status(400).json({ message: "Cannot buy into a closed position." });
        }
        if (position.accountID !== accountID) {
            return res.status(400).json({ message: "Position does not belong to this account." });
        }

        position.quantity += units;
        position.totalCostAmount += cost;
        position.totalFeesAmount += fee;
        position.currentUnitPriceAmount = unitPriceAmount;
        await position.save();
    } else {
        // Create new position
        if (!assetType || !assetName) {
            return res.status(400).json({ message: "assetType and assetName are required for new positions." });
        }

        position = await new InvestmentPosition({
            userID,
            accountID,
            assetType,
            assetName,
            symbol: symbol || "",
            quantity: units,
            totalCostAmount: cost,
            totalFeesAmount: fee,
            currentUnitPriceAmount: unitPriceAmount
        }).save();
    }

    // Create event
    const event = await new InvestmentEvent({
        userID,
        accountID,
        positionID: position._id.toString(),
        action: "BUY",
        date,
        description,
        units,
        unitPriceAmount,
        feeAmount: fee,
        realizedPnLAmount: 0
    }).save();

    // Subtract cost + fee from available balance
    await updateAccountBalances.updateAllAccountBalances(accountID, cost + fee, "-");
    await updateAccountBalances.recalcInvestedAmount(accountID);

    res.status(200).json(event);
};
//----------------------------------------------------------------------------------------------------------------------


const handleSell = async (params, res) => {
    const { userID, accountID, positionID, description, date, units, unitPriceAmount, feeAmount } = params;

    if (!units || units <= 0) {
        return res.status(400).json({ message: "Units must be greater than 0." });
    }
    if (!unitPriceAmount || !Number.isSafeInteger(unitPriceAmount) || unitPriceAmount <= 0) {
        return res.status(400).json({ message: "Unit price not a valid number." });
    }

    const position = await InvestmentPosition.findById(positionID);

    if (!position) {
        return res.status(404).json({ message: "No position with selected ID!" });
    }
    if (position.closed) {
        return res.status(400).json({ message: "Cannot sell from a closed position." });
    }
    if (position.accountID !== accountID) {
        return res.status(400).json({ message: "Position does not belong to this account." });
    }
    if (units > position.quantity) {
        return res.status(400).json({ message: "Cannot sell more units than held." });
    }

    const fee = Math.ceil(feeAmount || 0);
    const grossProceeds = Math.ceil(units * unitPriceAmount);
    const netProceeds = grossProceeds - fee;

    // Weighted-average cost basis for sold units
    const costBasisSold = Math.ceil((position.totalCostAmount / position.quantity) * units);
    const realizedPnL = netProceeds - costBasisSold;

    // Update position
    position.quantity -= units;
    position.totalCostAmount -= costBasisSold;
    position.totalFeesAmount += fee;
    position.realizedPnLAmount += realizedPnL;
    position.currentUnitPriceAmount = unitPriceAmount;

    if (position.quantity <= 0) {
        position.quantity = 0;
        position.totalCostAmount = 0;
        position.closed = true;
        position.closedAt = new Date();
    }

    await position.save();

    // Create event
    const event = await new InvestmentEvent({
        userID,
        accountID,
        positionID: position._id.toString(),
        action: "SELL",
        date,
        description,
        units,
        unitPriceAmount,
        feeAmount: fee,
        realizedPnLAmount: realizedPnL
    }).save();

    // Add net proceeds to available balance
    await updateAccountBalances.updateAllAccountBalances(accountID, netProceeds, "+");
    await updateAccountBalances.recalcInvestedAmount(accountID);

    res.status(200).json(event);
};
//----------------------------------------------------------------------------------------------------------------------


const handleYield = async (params, res) => {
    const { userID, accountID, positionID, description, date, unitPriceAmount, feeAmount } = params;

    if (!unitPriceAmount || !Number.isSafeInteger(unitPriceAmount) || unitPriceAmount <= 0) {
        return res.status(400).json({ message: "Amount not a valid number." });
    }

    const position = await InvestmentPosition.findById(positionID);

    if (!position) {
        return res.status(404).json({ message: "No position with selected ID!" });
    }
    if (position.closed) {
        return res.status(400).json({ message: "Cannot add yield to a closed position." });
    }
    if (position.accountID !== accountID) {
        return res.status(400).json({ message: "Position does not belong to this account." });
    }

    const fee = Math.ceil(feeAmount || 0);
    const netYield = unitPriceAmount - fee;

    position.totalFeesAmount += fee;
    position.totalYieldAmount += unitPriceAmount;
    await position.save();

    // Create event
    const event = await new InvestmentEvent({
        userID,
        accountID,
        positionID: position._id.toString(),
        action: "YIELD",
        date,
        description,
        unitPriceAmount,
        feeAmount: fee,
        realizedPnLAmount: 0
    }).save();

    // Add net yield to available balance
    await updateAccountBalances.updateAllAccountBalances(accountID, netYield, "+");

    res.status(200).json(event);
};
//----------------------------------------------------------------------------------------------------------------------


// Update current unit price on a position (price update)
const updatePositionPrice = async (req, res) => {

    const { currentUnitPriceAmount } = req.body;

    if (!currentUnitPriceAmount || !Number.isSafeInteger(currentUnitPriceAmount) || currentUnitPriceAmount <= 0) {
        return res.status(400).json({ message: "Price not a valid number." });
    }

    try {
        const position = await InvestmentPosition.findById(req.params.id);

        if (!position) {
            return res.status(404).json({ message: "No investment position with selected ID!" });
        }

        if (position.closed) {
            return res.status(400).json({ message: "Cannot update price on a closed position." });
        }

        position.currentUnitPriceAmount = currentUnitPriceAmount;
        await position.save();

        await updateAccountBalances.recalcInvestedAmount(position.accountID);

        res.status(200).json(position);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while updating position price!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Update position display info (assetName, symbol, assetType)
const updatePositionInfo = async (req, res) => {

    const { assetName, symbol, assetType } = req.body;

    if (assetName?.length > 64) {
        return res.status(400).json({ message: "Asset name too long." });
    }
    if (symbol?.length > 24) {
        return res.status(400).json({ message: "Symbol too long." });
    }

    try {
        const position = await InvestmentPosition.findById(req.params.id);

        if (!position) {
            return res.status(404).json({ message: "No investment position with selected ID!" });
        }

        if (assetName) position.assetName = assetName;
        if (symbol !== undefined) position.symbol = symbol;
        if (assetType) position.assetType = assetType;

        await position.save();

        res.status(200).json(position);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while updating position info!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Update event display info (description, date)
const updateEventInfo = async (req, res) => {

    const { description, date } = req.body;

    if (description?.length > 32) {
        return res.status(400).json({ message: "Description too long." });
    }

    try {
        const event = await InvestmentEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "No investment event with selected ID!" });
        }

        if (description !== undefined) event.description = description;
        if (date) event.date = date;

        await event.save();

        res.status(200).json(event);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while updating investment event!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Delete the most recent event for a position (undo last action)
const removeLatestEvent = async (req, res) => {
    try {
        const event = await InvestmentEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "No investment event with selected ID!" });
        }

        // Verify it is the latest event by creation order (not date)
        const latestEvent = await InvestmentEvent
            .findOne({ positionID: event.positionID })
            .sort({ _id: -1 });

        if (latestEvent._id.toString() !== event._id.toString()) {
            return res.status(400).json({ message: "Can only delete the latest event for a position." });
        }

        const position = await InvestmentPosition.findById(event.positionID);

        if (!position) {
            return res.status(404).json({ message: "No position found for this event." });
        }

        // Reverse the event's effect on the position
        position.totalFeesAmount -= event.feeAmount;

        if (event.action === "BUY") {
            position.quantity -= event.units;
            position.totalCostAmount -= Math.ceil(event.units * event.unitPriceAmount);

            // Refund cost + fee to available balance
            const cost = Math.ceil(event.units * event.unitPriceAmount) + event.feeAmount;
            await updateAccountBalances.updateAllAccountBalances(event.accountID, cost, "+");

        } else if (event.action === "SELL") {
            // Derive the exact costBasisSold from stored event data
            const grossProceeds = Math.ceil(event.units * event.unitPriceAmount);
            const costBasisSold = grossProceeds - event.feeAmount - event.realizedPnLAmount;

            position.quantity += event.units;
            position.totalCostAmount += costBasisSold;
            position.realizedPnLAmount -= event.realizedPnLAmount;
            position.closed = false;
            position.closedAt = null;

            // Remove net proceeds from available balance
            const netProceeds = grossProceeds - event.feeAmount;
            await updateAccountBalances.updateAllAccountBalances(event.accountID, netProceeds, "-");

        } else if (event.action === "YIELD") {
            position.totalYieldAmount -= event.unitPriceAmount;

            // Remove net yield from available balance
            const netYield = event.unitPriceAmount - event.feeAmount;
            await updateAccountBalances.updateAllAccountBalances(event.accountID, netYield, "-");
        }

        // Delete the event first, then decide if position should be removed
        await InvestmentEvent.findByIdAndDelete(event._id);

        // Only delete position if no events remain for it
        const remainingEvents = await InvestmentEvent.countDocuments({ positionID: position._id.toString() });
        if (remainingEvents === 0) {
            await InvestmentPosition.findByIdAndDelete(position._id);
        } else {
            await position.save();
        }

        await updateAccountBalances.recalcInvestedAmount(event.accountID);

        res.send({ message: "Investment event deleted!" });

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while deleting investment event!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Delete an entire position and all its events, reversing all balance effects
const removePosition = async (req, res) => {
    try {
        const position = await InvestmentPosition.findById(req.params.id);

        if (!position) {
            return res.status(404).json({ message: "No investment position with selected ID!" });
        }

        const events = await InvestmentEvent.find({ positionID: position._id.toString() });

        // Sum up the net cash effect of all events to reverse it
        let netCashEffect = 0;
        for (const event of events) {
            if (event.action === "BUY") {
                netCashEffect -= Math.ceil(event.units * event.unitPriceAmount) + event.feeAmount;
            } else if (event.action === "SELL") {
                netCashEffect += Math.ceil(event.units * event.unitPriceAmount) - event.feeAmount;
            } else if (event.action === "YIELD") {
                netCashEffect += event.unitPriceAmount - event.feeAmount;
            }
        }

        // Reverse the net effect on available balance
        if (netCashEffect > 0) {
            await updateAccountBalances.updateAllAccountBalances(position.accountID, netCashEffect, "-");
        } else if (netCashEffect < 0) {
            await updateAccountBalances.updateAllAccountBalances(position.accountID, Math.abs(netCashEffect), "+");
        }

        await InvestmentEvent.deleteMany({ positionID: position._id.toString() });
        await InvestmentPosition.findByIdAndDelete(position._id);
        await updateAccountBalances.recalcInvestedAmount(position.accountID);

        res.send({ message: "Investment position deleted!" });

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while deleting investment position!"
        });
    }
};
//----------------------------------------------------------------------------------------------------------------------


// Portfolio breakdown by asset type for an account
const positionsBreakdown = async (req, res) => {
    try {
        const pipeline = [
            { $match: { accountID: req.params.aid, closed: false } },
            {
                $group: {
                    _id: "$assetType",
                    totalMarketValue: { $sum: { $multiply: ["$quantity", "$currentUnitPriceAmount"] } },
                    totalCost: { $sum: "$totalCostAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalMarketValue: -1 } }
        ];

        const breakdown = await InvestmentPosition.aggregate(pipeline);

        res.status(200).json(breakdown);

    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching portfolio breakdown!"
        });
    }
};

export default {
    findAllEventsByAccountID,
    findEventsByPositionID,
    findPositionsByAccountID,
    findEventByID,
    findPositionByID,
    create,
    updatePositionPrice,
    updatePositionInfo,
    updateEventInfo,
    removeLatestEvent,
    removePosition,
    positionsBreakdown
}