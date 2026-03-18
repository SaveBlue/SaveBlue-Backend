import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const investmentAssetTypes = [
    { value: "ETF",                label: "ETF" },
    { value: "STOCK",              label: "Stock" },
    { value: "BOND",               label: "Bond" },
    { value: "MUTUAL_FUND",        label: "Mutual Fund" },
    { value: "REAL_ESTATE",        label: "Real Estate" },
    { value: "CRYPTO",             label: "Crypto" },
    { value: "COMMODITY",          label: "Commodity" },
    { value: "FIXED_TERM_DEPOSIT", label: "Fixed-Term Deposit" },
    { value: "SAVINGS_ACCOUNT",    label: "Savings Account" }
];

const assetTypeValues = investmentAssetTypes.map(t => t.value);

export const investmentActions = [
    { value: "BUY",   label: "Buy" },
    { value: "SELL",  label: "Sell" },
    { value: "YIELD", label: "Yield" }
];

const actionValues = investmentActions.map(a => a.value);

function round(value) {
    return Math.ceil(value);
}

function roundQuantity(value) {
    return Math.round((Number(value) + Number.EPSILON) * 1e8) / 1e8;
}

const investmentPosition = new Schema(
    {
        userID: { type: String, required: true },
        accountID: { type: String, required: true },

        assetType: { type: String, enum: assetTypeValues, required: true },
        assetName: { type: String, maxlength: 64, required: true },
        symbol: { type: String, maxlength: 24, default: "" },

        quantity: { type: Number, min: 0, set: roundQuantity, required: true },
        totalCostAmount: { type: Number, min: 0, set: round, required: true },
        currentUnitPriceAmount: { type: Number, min: 0, set: round, required: true },

        totalFeesAmount: { type: Number, min: 0, set: round, default: 0 },
        totalYieldAmount: { type: Number, min: 0, set: round, default: 0 },
        realizedPnLAmount: { type: Number, set: round, default: 0 },
        closed: { type: Boolean, default: false },
        openedAt: { type: Date, default: Date.now },
        closedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

investmentPosition.index({ accountID: 1, closed: 1 });

const investmentEvent = new Schema(
    {
        userID: { type: String, required: true },
        accountID: { type: String, required: true },
        positionID: { type: String, required: true },

        action: { type: String, enum: actionValues, required: true },
        date: { type: Date, default: Date.now, required: true },
        description: { type: String, maxlength: 32, default: "" },

        units: { type: Number, min: 0, set: roundQuantity },
        unitPriceAmount: { type: Number, min: 0, set: round },
        feeAmount: { type: Number, min: 0, set: round, default: 0 },
        realizedPnLAmount: { type: Number, set: round, default: 0 }
    },
    { timestamps: true }
);

investmentEvent.index({ accountID: 1, date: -1, _id: -1 });
investmentEvent.index({ positionID: 1, date: 1, _id: 1 });

mongoose.model('InvestmentPosition', investmentPosition);
mongoose.model('InvestmentEvent', investmentEvent);
