import OpenAI from "openai";
import {categoriesExpenses} from "../models/expenses.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'api-key',
});


const createExpense = async (sms) => {

    const completion = await openai.chat.completions.create({
        //model: "gpt-4-1106-preview",
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    //"You process and categorize received SMS transaction data sent in JSON format. Prepare a json response object containing the following: date (change from DD.MM.YYYY to MM.DD.YYYY), amount (in cents), and description (maximum of 5 words). Then categorize the transaction by choosing the right category1 and corresponding category2 based on the json in the next message. For ambiguous cases, set 'Draft' for both 'category1' and 'category2'. If you encounter an error, return a json object with the error property equal to true."
                    //"You process and categorize received SMS transaction data sent in JSON format. Prepare a json response object containing the following: amount (in cents), and description (maximum of 5 words). Then categorize the transaction by choosing the right category1 and corresponding category2 based on the json in the next message (use just the provided category names, do not alter category names). For ambiguous cases, set 'Draft' for both 'category1' and 'category2'. If you encounter an error, return a json object with the error property equal to true."
                    "You are a helpful finance tracking assistant. You process and categorize received SMS expense data sent in JSON format. Prepare a json response object containing the following: amount (the amount will be in Euros but always convert it to integer cents value), and description (maximum of 5 words, based on what you receive, ideally the name of the store/service). If the data contains the date (which will always be in European DD-MM-YYYY format), include it in the property 'date' so that the backend can correctly parse the value with `new Date(date)`, otherwise don't create the json property for date at all. Then categorize the transaction by choosing the right category1 value and corresponding category2 value based on the json in the next message (use just the provided category names exactly, do not alter category names, keep the capitalization the same as in the provided json). For ambiguous cases, set 'Draft' for both 'category1' and 'category2'. If you encounter an error, return a json object with the error property equal to true. Example 1: {'description': 'some purchase', 'date': '2023-12-13', 'amount:' 190, 'category1': 'Draft', 'category2': 'Draft'}, example 2: {'description': 'Mercator supermarket', 'amount:' 190, 'category1': 'Foods & Drinks', 'category2': 'Groceries'}."
            },
            {
                role: "system",
                content: JSON.stringify(categoriesExpenses)
            },
            {role: "user", content: sms},
        ],
        response_format: "json_object",
    });

    return JSON.parse(completion.choices[0].message.content);
}

export default { createExpense }