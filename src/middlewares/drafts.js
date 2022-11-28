const mongoose = require('mongoose');
const User = mongoose.model('User');


exports.createExpenseSMS = async (req, res, next) => {

    let user = {}

    // Fetch user id and draftsAccount id
    try {
        user = await User.findOne({'_id': req.params.tokenId}, 'draftsAccount')
        if (!user) {
            return res.status(404).json({
                message: "No user with selected ID!"
            });
        }
    }
    catch (error){
        res.status(500).send({
            message: error.message || "An error occurred while fetching user!"
        });
    }

    // Extract data from sms
    let sms = req.body.sms
    let smsData = {}

    try {
        if(sms.startsWith("POS NAKUP")){
            smsData.description = sms.split("EUR, ")[1].split(". Info")[0].substring(0, 32)
            let date = sms.split("POS NAKUP ")[1].split(" ")[0].split(".")
            smsData.date = new Date(date[2],date[1]-1, date[0])
            smsData.amount = parseInt(sms.split("znesek ")[1].split(" EUR")[0].replaceAll(",", "").replaceAll(".", ""))
        }
    }
    catch (e){
        return res.status(400).json({
            message: "SMS not valid."
        });
    }

    req.body.userID = user._id
    req.body.accountID = user.draftsAccount._id
    req.body.description = smsData.description || ""
    req.body.date = smsData.date
    req.body.amount = smsData.amount || 0
    req.body.category1 = "Draft"
    req.body.category2 = "Draft"

    next();

};


// Do not allow users to create drafts in regular accounts
exports.block = (req, res, next) => {
    if(req.body.category1 === "Draft" || req.body.category2 && req.body.category2 === "Draft"){
        return res.status(400).json({
            message: "Cannot create draft in regular account."
        });
    }

    next();
}

