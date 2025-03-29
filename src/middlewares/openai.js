import OpenAI from "openai";
import {categoriesExpenses} from "../models/expenses.js";
import { z } from "zod";
import {zodResponseFormat} from "openai/helpers/zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'api-key',
});


const createExpense = async (sms) => {

    const ExpenseEntry = z.object({
        description: z.string(),
        date: z.string().optional(),
        amount: z.number().int(),
        category1: z.string(),
        category2: z.string(),
    });

    const completion = await openai.chat.completions.create({
        //model: "gpt-4-1106-preview",
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    //"You process and categorize received SMS transaction data sent in JSON format. Prepare a json response object containing the following: date (change from DD.MM.YYYY to MM.DD.YYYY), amount (in cents), and description (maximum of 5 words). Then categorize the transaction by choosing the right category1 and corresponding category2 based on the json in the next message. For ambiguous cases, set 'Draft' for both 'category1' and 'category2'. If you encounter an error, return a json object with the error property equal to true."
                    //"You process and categorize received SMS transaction data sent in JSON format. Prepare a json response object containing the following: amount (in cents), and description (maximum of 5 words). Then categorize the transaction by choosing the right category1 and corresponding category2 based on the json in the next message (use just the provided category names, do not alter category names). For ambiguous cases, set 'Draft' for both 'category1' and 'category2'. If you encounter an error, return a json object with the error property equal to true."
                    "You are a helpful finance tracking assistant. You process and categorize received SMS expense data sent in JSON format. Prepare a json response object containing the following: amount (the amount will be in Euros but always convert it to integer cents value), and description (up to 32 characters, based on what you receive, ideally the name of the store/service). If the data contains the date (which will always be in European DD.MM.YYYY format, so carefully rewrite it as YYYY-MM-DD), include it in the property 'date' in format YYYY-MM-DD, otherwise completely omit the date property from your response. Then categorize the transaction by choosing the right category1 value and corresponding category2 value based on the json in the next message (use just the provided category names exactly, do not alter category names, keep the capitalization the same as in the provided json). For ambiguous cases, set 'Draft' for both 'category1' and 'category2'. If you encounter an error, return a json object with the error property equal to true."
            },
            {
                role: "system",
                content: JSON.stringify(categoriesExpenses)
            },
            {role: "user", content: sms},
        ],
        response_format: zodResponseFormat(ExpenseEntry, "expense")
    });

    return JSON.parse(completion.choices[0].message.content);
}

export default { createExpense }