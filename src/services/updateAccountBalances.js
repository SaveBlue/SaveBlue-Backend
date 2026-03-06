import mongoose from 'mongoose';

const User = mongoose.model('User');
const InvestmentPosition = mongoose.model('InvestmentPosition');

// Update availableBalance for income/expense/investment cashflow operations
const updateAllAccountBalances = async (accountID, amount, operation) => {

    try {
        const user = await User.findOne({ $or: [{ 'accounts._id': accountID }, { 'draftsAccount._id': accountID }] });

        if (!user) {
            throw new Error("No account with selected ID!");
        }

        // Get requested account or drafts account from the user
        let account = user.accounts.id(accountID) || user.draftsAccount;

        // Add or subtract from account balance
        const roundedAmount = Math.ceil(amount);

        // Add or subtract from account balance
        switch (operation) {
            case "+":
                account.availableBalance += roundedAmount;
                break;

            case "-":
                account.availableBalance -= roundedAmount;
                break;
        }

        await user.save();

    } catch (error) {
        // Propagate the error message, with a fallback default message
        throw new Error(error || "An error occurred while updating account!");
    }

}

// Recalculate investedAmount from all open positions for an account
const recalcInvestedAmount = async (accountID) => {

    try {
        const user = await User.findOne({ $or: [{ 'accounts._id': accountID }, { 'draftsAccount._id': accountID }] });

        if (!user) {
            throw new Error("No account with selected ID!");
        }

        let account = user.accounts.id(accountID) || user.draftsAccount;

        const result = await InvestmentPosition.aggregate([
            { $match: { accountID: accountID, closed: false } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$currentUnitPriceAmount"] } } } }
        ]);

        account.investedAmount = result[0]?.total || 0;

        await user.save();

    } catch (error) {
        throw new Error(error || "An error occurred while recalculating invested amount!");
    }

}
// TODO: IMPLEMENT GOALS BEFORE REFACTORING

// Update both availableAmount & goal currentAmount
const updateGoalAmount = (goalID, amount, operation) => {

    return new Promise((resolve, reject) => {

        // Find the user with requested account
        User.findOne({ 'accounts.goals._id': goalID }, 'accounts.goals accounts.availableBalance')
            .then(user => {

                if (!user) {
                    reject("No goal with selected ID!");
                }

                // Get requested account & goal from the user
                let account = user.accounts[0];
                let goal = user.accounts[0].goals.id(goalID);

                // Add or subtract from account balance & goal currentAmount
                switch (operation) {
                    case "+":
                        account.availableBalance -= Math.ceil(amount);
                        goal.currentAmount += Math.ceil(amount);
                        break;

                    case "-":
                        account.availableBalance += Math.ceil(amount);
                        goal.currentAmount -= Math.ceil(amount);
                        break;
                }


                // Save updated user data (updated account)
                user.save()
                    .then(() => {
                        resolve();
                    })
                    .catch(error => {
                        reject(error.message || "An error occurred while updating account!");

                    });
            })
            .catch(error => {
                reject(error.message || "An error occurred while fetching account!");

            })
    })
}

export default { updateAllAccountBalances, updateGoalAmount, recalcInvestedAmount }