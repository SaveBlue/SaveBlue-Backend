import mongoose from 'mongoose';

const User = mongoose.model('User');

// Update both totalAmount and availableAmount
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
                account.totalBalance += roundedAmount;
                account.availableBalance += roundedAmount;
                break;

            case "-":
                account.totalBalance -= roundedAmount;
                account.availableBalance -= roundedAmount;
                break;
        }

        await user.save();

    } catch (error) {
        // Propagate the error message, with a fallback default message
        throw new Error(error || "An error occurred while updating account!");
    }

}
// TODO: IMPLEMENT GOALS BEFORE REFACTORING

// Update both availableAmount & goal currentAmount
const updateGoalAmount = (goalID, amount, operation) => {

    return new Promise((resolve, reject) => {

        // Find the user with requested account
        User.findOne({'accounts.goals._id': goalID}, 'accounts.goals accounts.availableBalance')
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

export default {updateAllAccountBalances, updateGoalAmount}