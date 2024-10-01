import { PNG } from 'pngjs';
import crypto from 'crypto';

export const pngString = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAACklEQVR4AWNgAAAAAgABc3UBGAAAAABJRU5ErkJggg==";

export const pngStringTooLarge = () => {
    const width = 500;
    const height = 550;
    const png = new PNG({ width, height });
    const pixelDataSize = width * height * 4;
    const randomBytes = crypto.randomBytes(pixelDataSize);
    randomBytes.copy(png.data);
    const buffer = PNG.sync.write(png);

    return buffer.toString('base64')
}

export const pngFile = {
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

export const accountDataToChangeExpenseAccountStart = {
    name: 'Remove from acc',
    availableBalance: -testExpenseData.amount,
    totalBalance: -testExpenseData.amount,
    startOfMonth: 1,
    budgets: [],
    goals: [],
    expenses: [],
    incomes: [],
}

export const accountDataToChangeExpenseAccountDest = {
    name: 'Add to acc',
    availableBalance: 0,
    totalBalance: 0,
    startOfMonth: 1,
    budgets: [],
    goals: [],
    expenses: [],
    incomes: [],
}

const mockData = {
    testUserData,
    userToDelete,
    userToUpdate,
    testAccountData,
    accountDataToDelete,
    accountDataToUpdate,
    accountDataToChangeExpenseAccountStart,
    accountDataToChangeExpenseAccountDest,
    testExpenseData,
    expenseDataToDelete,
    expenseDataToUpdate,
    testIncomeData,
    incomeDataToDelete,
    incomeDataToUpdate,
    pngFile,
};

export default mockData;