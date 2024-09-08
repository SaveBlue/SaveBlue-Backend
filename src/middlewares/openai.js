import OpenAI from "openai";
import categoriesExpenses from "../models/expenses.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'api-key',
});


const createExpense = async (sms) => {

    const completion = await openai.chat.completions.create({
        //model: "gpt-4-1106-preview",
        model: "gpt-3.5-turbo-1106",
        messages: [
            {
                role: "system",
                content:
                    //"You process and categorize received SMS transaction data sent in JSON format. Prepare a json response object containing the following: date (change from DD.MM.YYYY to MM.DD.YYYY), amount (in cents), and description (maximum of 5 words). Then categorize the transaction by choosing the right category1 and corresponding category2 based on the json in the next message. For ambiguous cases, set 'Draft' for both 'category1' and 'category2'. If you encounter an error, return a json object with the error property equal to true."
                    "You process and categorize received SMS transaction data sent in JSON format. Prepare a json response object containing the following: amount (in cents), and description (maximum of 5 words). Then categorize the transaction by choosing the right category1 and corresponding category2 based on the json in the next message (use just the provided category names, do not alter category names). For ambiguous cases, set 'Draft' for both 'category1' and 'category2'. If you encounter an error, return a json object with the error property equal to true."
            },
            {
                role: "system",
                content: JSON.stringify(categoriesExpenses)
            },
            {role: "user", content: sms},
        ],
        response_format: {type: "json_object"}
    });

    return JSON.parse(completion.choices[0].message.content);
}

export default { createExpense }