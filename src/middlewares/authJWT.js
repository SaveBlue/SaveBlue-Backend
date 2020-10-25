const jwt = require("jsonwebtoken");
const config = require("../config/auth");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Expense = mongoose.model('Expense');
const Income = mongoose.model('Income');


// Verify User
verifyTokenUser = (req, res, next) => {

    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }

        // Verify that sent user id is the same as token's
        if(req.params.id === decoded.id || req.params.uid === decoded.id)
            next();
        else
            return res.status(401).send({message: "Unauthorized!"});
    });
};
//----------------------------------------------------------------------------------------------------------------------


// Verify Account
verifyTokenAccount = (req, res, next) => {

    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }

        // Verification if the account id belongs to the same user id provided in JWT token
        // Uses either id or aid from request parameters
        verifyUsersCall(req, res, next, {'accounts._id': req.params.id || req.params.aid},decoded.id)

    });
};
//----------------------------------------------------------------------------------------------------------------------


// Verify Expenses
verifyTokenExpense = (req, res, next) => {

    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }

        // Verification if user id in expense belongs to the same user id provided in JWT token
        Expense.findById(req.params.id, 'userID')
            .then(userID => {

                if (!userID) {
                    return res.status(404).json({
                        message: "No expense with selected ID!"
                    });
                }

                // Verify that user id of requested expense is the same as the one provided in JWT token
                if(userID.userID === decoded.id)
                    next();
                else
                    return res.status(401).send({message: "Unauthorized!"});

            })
            .catch(error => {
                res.status(500).send({
                    message: error.message || "An error occurred while fetching account!"
                });
            });

    });
};
//----------------------------------------------------------------------------------------------------------------------


// Verify Incomes
verifyTokenIncome = (req, res, next) => {

    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }

        // Verification if user id in expense belongs to the same user id provided in JWT token
        Income.findById(req.params.id, 'userID')
            .then(userID => {

                if (!userID) {
                    return res.status(404).json({
                        message: "No income with selected ID!"
                    });
                }

                // Verify that user id of requested income is the same as the one provided in JWT token
                if(userID.userID === decoded.id)
                    next();
                else
                    return res.status(401).send({message: "Unauthorized!"});

            })
            .catch(error => {
                res.status(500).send({
                    message: error.message || "An error occurred while fetching account!"
                });
            });

    });
};
//----------------------------------------------------------------------------------------------------------------------


verifyTokenExpenseIncomePost = (req, res, next) => {

    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }

        // Verification if user id in expense request belongs to the same user id provided in JWT token
        if(req.body.userID !== decoded.id)
            return res.status(401).send({message: "Unauthorized!"});

        // Verification if users account id in expense request belongs to the same user provided in JWT token
        verifyUsersCall(req, res, next, {'accounts._id': req.body.accountID},decoded.id)

    });
};
//----------------------------------------------------------------------------------------------------------------------


/**
 *
 * @param req - request (passthrough)
 * @param res - response (passthrough)
 * @param next - call clear api call (passthrough)
 * @param searchParam - parameters for querying
 * @param decodedID - decoded id from JWT token
 *
 * Function checks users permission if his JWT token allows access to requested data
 */
verifyUsersCall = (req, res, next, searchParam, decodedID) =>{

    User.findOne(searchParam, '_id')
        .then(ID => {

            if (!ID) {
                return res.status(404).json({
                    message: "No account with selected ID!"
                });
            }

            // Verify that user id of requested account is the same as the one provided in JWT token
            if(ID._id.equals(decodedID))
                next();
            else
                return res.status(401).send({message: "Unauthorized!"});

        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "An error occurred while fetching account!"
            });
        });
}
//----------------------------------------------------------------------------------------------------------------------


const authJwt = {
    verifyTokenUser: verifyTokenUser,
    verifyTokenAccount: verifyTokenAccount,
    verifyTokenExpense: verifyTokenExpense,
    verifyTokenIncome: verifyTokenIncome,
    verifyTokenExpenseIncomePost: verifyTokenExpenseIncomePost
};
module.exports = authJwt;
