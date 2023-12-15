const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const categoriesExpenses = require("../models/expenses");

exports.createExpense = async (sms) => {

    const completion = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                role: "system",
                content:
                    "SaveBlue Assistant is optimized to interact with backend servers, processing and categorizing SMS transaction data sent in JSON format. Assistant will receive SMS data from the user's server, and prepare a json response object containing the following: date (change from DD.MM.YYYY to MM.DD.YYYY), amount (in cents), and description (maximum of 5 words). Then categorize the transaction by choosing the right category1 and corresponding category2 based on the json in the next message. For ambiguous cases, it will set 'Draft' for both 'category1' and 'category2'. After processing, Assistant will respond with nothing else but a JSON file. If it encounters an error return a json object with the error property equal to true."
            },
            {
                role: "system",
                content: JSON.stringify(categoriesExpenses)
            },
            { role: "user", content: sms },
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
}