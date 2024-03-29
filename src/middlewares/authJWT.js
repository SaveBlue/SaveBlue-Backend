const jwt = require("jsonwebtoken");
const config = require("../config/auth");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Expense = mongoose.model('Expense');
const Income = mongoose.model('Income');
const Token = mongoose.model('Token');


// Verify token in whitelist
verifyTokenWhitelist = (req, res, next) => {

    let token = req.headers["x-access-token"];

    // check token existence
    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }

    // verify token
    jwt.verify(token, config.secret, (err, decoded) => {

        // invalid token
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }

        Token.findOne({'token': token})
            .then(token => {
                if (!token) {
                    return res.status(401).json({
                        message: "Unauthorized!"
                    });
                }

                req.params.tokenId = decoded.id

                next();

            })
            .catch(error => {
                res.status(500).send({
                    message: error.message || "An error occurred while checking whitelist!"
                });
            });
    })
};
//----------------------------------------------------------------------------------------------------------------------


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
        // Uses either id or aid from request parameters to search user's accounts
        //verifyUsersCall(req, res, next, {'accounts._id': req.params.id || req.params.aid},decoded.id)
        verifyUsersCall(req, res, next, [
            {'accounts._id': req.params.id || req.params.aid},
        ],decoded.id)

    });
};
//----------------------------------------------------------------------------------------------------------------------


// Verify Account or Drafts Account
verifyTokenAccountOrDrafts = (req, res, next) => {

    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }

        // Verification if the regular account or drafts account id belongs to the same user id provided in JWT token
        // Uses either id or aid from request parameters to search user's accounts and draft account
        verifyUsersCall(req, res, next, [
            {'accounts._id': req.params.id || req.params.aid},
            {'draftsAccount._id': req.params.aid},
        ],decoded.id)

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
        verifyUsersCall(req, res, next, [{'accounts._id': req.body.accountID}],decoded.id)

    });
};
//----------------------------------------------------------------------------------------------------------------------


// Verify Goal
verifyTokenGoal = (req, res, next) => {

    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }

        // Verification if the goal id belongs to the same user id provided in JWT token
        verifyUsersCall(req, res, next, [{'accounts.goals._id': req.params.id}], decoded.id)

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

    User.findOne({$or:searchParam}, '_id')
        .then(ID => {

            if (!ID) {
                return res.status(404).json({
                    message: "No account for selected user ID!"
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
                message: error.message || "An error occurred while fetching user!"
            });
        });
}
//----------------------------------------------------------------------------------------------------------------------


const authJwt = {
    verifyTokenWhitelist: verifyTokenWhitelist,
    verifyTokenUser: verifyTokenUser,
    verifyTokenAccount: verifyTokenAccount,
    verifyTokenAccountOrDrafts: verifyTokenAccountOrDrafts,
    verifyTokenExpense: verifyTokenExpense,
    verifyTokenIncome: verifyTokenIncome,
    verifyTokenExpenseIncomePost: verifyTokenExpenseIncomePost,
    verifyTokenGoal: verifyTokenGoal
};
module.exports = authJwt;
