import mongoose from "mongoose";

export const pngString = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAACklEQVR4AWNgAAAAAgABc3UBGAAAAABJRU5ErkJggg==";
export const tooLongPngString = "Invalid file type."
const pngFile = {
    contentType: "image/png",
    data: Buffer.from(pngString, 'base64')
}

export const testUserData = {
    username: 'testuser',
    password: 'testpassword',
    email: 'test@test.com'
};

export const userToDelete = {
    username: 'deleteMe',
    password: 'deleteMe',
    email: 'delete@me.com'
};

export const userToUpdate = {
    username: 'updateMe',
    password: 'updateMe',
    email: 'update@me.com'
};

export const testAccountData = {
    name: 'Test Wallet',
    availableBalance: 0,
    totalBalance: 0,
    startOfMonth: 1,
    budgets: [],
    goals: [],
    expenses: [],
    incomes: [],
}

export const accountDataToDelete = {
    name: 'Delete this Wallet',
    availableBalance: 0,
    totalBalance: 0,
    startOfMonth: 1,
    budgets: [],
    goals: [],
    expenses: [],
    incomes: [],
}

export const accountDataToUpdate = {
    name: 'Update this Wallet',
    availableBalance: 0,
    totalBalance: 0,
    startOfMonth: 1,
    budgets: [],
    goals: [],
    expenses: [],
    incomes: [],
}

export const testExpenseData = {
    amount: 1000,
    category1: "Food & Drinks",
    category2: "Alcohol",
    description: "Test Expense",
    date: "2024-04-09",
}

export const expenseDataToDelete = {
    amount: 2000,
    category1: "Food & Drinks",
    category2: "Alcohol",
    description: 'Delete this Expense',
    date: "2024-04-09"
}

export const expenseDataToUpdate = {
    amount: 3000,
    category1: "Food & Drinks",
    category2: "Alcohol",
    description: 'Update this Expense',
    date: "2024-04-09"
}

export const testIncomeData = {
    amount: 1000,
    category1: "Salary & Wage",
    description: "Test Income",
    date: "2024-04-09"
}

export const incomeDataToDelete = {
    amount: 2000,
    category1: "Salary & Wage",
    description: 'Delete this Income',
    date: "2024-04-09"
}

export const incomeDataToUpdate = {
    amount: 3000,
    category1: "Salary & Wage",
    description: 'Update this Income',
    date: "2024-04-09"
}

const mockData = {
    testUserData,
    userToDelete,
    userToUpdate,
    testAccountData,
    accountDataToDelete,
    accountDataToUpdate,
    testExpenseData,
    expenseDataToDelete,
    expenseDataToUpdate,
    testIncomeData,
    incomeDataToDelete,
    incomeDataToUpdate,
    pngFile
};

export default mockData;