import mongoose from 'mongoose';
import openai from './openai.js'

const User = mongoose.model('User');

const parseSmsManually = (sms, isNlb) => {
    let smsData = {}
    if (isNlb) {
        smsData.description = sms.split("EUR, ")[1].split(". Info")[0].substring(0, 32)
        let date = sms.split("POS NAKUP ")[1].split(" ")[0].split(".")
        smsData.date = new Date(date[2], date[1] - 1, date[0])
        smsData.amount = parseInt(sms.split("znesek ")[1].split(" EUR")[0].replaceAll(",", "").replaceAll(".", ""))
    } else {
        smsData.description = sms.split(" €")[0].substring(0, 32)
        smsData.date = Date.now();
        smsData.amount = parseInt(sms.split(" €")[1].split(" ")[0].replaceAll(",", "").replaceAll(".", ""))
    }
    smsData.category1 = "Draft"
    smsData.category2 = "Draft"
    return smsData
};

const parseSmsWithAI = async (sms) => {
    try {
        const smsAI = await openai.createExpense(sms)
        const parsedDate = (smsAI.date && (new Date(smsAI.date).toString() !== "Invalid Date")) ? new Date(smsAI.date) : Date.now()
        return {
            description: smsAI.description?.slice(0, 31),
            date: parsedDate,
            amount: parseInt(smsAI.amount),
            category1: smsAI.category1,
            category2: smsAI.category2
        };
    } catch (e) {
        console.log(e)
        throw new Error("AI SMS parsing failed.")
    }
};

const createExpenseSMS = async (req, res, next) => {

    // Fetch user id and draftsAccount id
    let user = null
    try {
        user = await User.findOne({'_id': req.params.tokenId}, 'draftsAccount')
        if (!user) {
            return res.status(404).json({
                message: "No user with selected ID!"
            });
        }
    } catch (error) {
        res.status(500).send({
            message: error.message || "An error occurred while fetching user!"
        });
    }

    // Extract data from sms
    try {
        const sms = req.body.sms
        const isNlb = sms.startsWith("POS NAKUP");
        let smsData;

        if (req.body.ai) {
            smsData = await parseSmsWithAI(sms);
        } else {
            smsData = parseSmsManually(sms, isNlb);
        }

        req.body.userID = user._id
        req.body.accountID = user.draftsAccount._id
        req.body.description = smsData.description || ""
        req.body.date = smsData.date
        req.body.amount = smsData.amount || 0
        req.body.category1 = smsData.category1 || "Draft"
        req.body.category2 = smsData.category2 || "Draft"

        next();
    } catch (error) {
        res.status(500).send({message: error.message || "An error occurred while processing the request!"});
    }
};


// Do not allow users to create drafts in regular accounts
const block = (req, res, next) => {
    if (req.body.category1 === "Draft" || (req.body.category2 && req.body.category2 === "Draft")) {
        return res.status(400).json({
            message: "Cannot use draft in regular account."
        });
    }

    next();
}

export default {
  createExpenseSMS,
  block
}