const mongoose = require('mongoose');
const User = mongoose.model('User');

// Create drafts account
exports.create = async (userID) => {
    const draftsAccount = {
        name: "Drafts",
        totalBalance: 0,
        availableBalance: 0,
        budgets: [],
        goals: [],
        expenses: [],
        incomes: [],
        startOfMonth: 1
    };

    try {
        const user = await User.findByIdAndUpdate(
            userID,
            { $set: { draftsAccount: draftsAccount } },
            { new: true, select: 'draftsAccount' }
        );

        if (!user) {
            throw new Error("No user with selected ID!");
        }

        return user.draftsAccount;
    } catch (error) {
        throw new Error(error || "An error occurred while adding drafts account!");
    }
};
