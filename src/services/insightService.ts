import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWeeklyMealDetails } from "./mealService";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");

export interface InsightReport {
    summary: string;
    tips: string[];
    score: number; // 0-100
    nutritionAnalysis: string;
}

export const generateHealthInsights = async (userId: string): Promise<InsightReport | null> => {
    try {
        const weeklyMeals = await getWeeklyMealDetails(userId);

        if (weeklyMeals.length === 0) {
            return {
                summary: "Not enough data yet.",
                tips: ["Start logging your meals to get personalized insights!"],
                score: 0,
                nutritionAnalysis: "No meals logged in the last 7 days."
            };
        }

        const simplifiedMeals = weeklyMeals.map(m => ({
            food: m.foodName,
            kcal: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
            category: m.category,
            date: m.date
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Analyze the following meal logs for a user over the last 7 days:
            ${JSON.stringify(simplifiedMeals)}

            Provide a health insight report in JSON format with the following fields:
            - summary: A brief summary of their eating pattern and nutrition quality.
            - tips: An array of 3 actionable, specific health tips based on their actual food choices.
            - score: A nutrition score from 0-100.
            - nutritionAnalysis: A more detailed analysis of their macro balance and caloric intake.

            Format the response as a JSON string. Do not include markdown formatting like \`\`\`json.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        try {
            return JSON.parse(text) as InsightReport;
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            return null;
        }
    } catch (error) {
        console.error("Error generating insights:", error);
        return null;
    }
};
