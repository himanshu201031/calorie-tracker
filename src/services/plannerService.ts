import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface MealPlanItem {
    meal: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    reason: string;
}

export const generateMealPlan = async (targetCalories: number, preferences: string = "No specific preferences") => {
    if (!API_KEY) throw new Error("API Key missing");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a daily meal plan for a target of ${targetCalories} calories.
    Preferences: ${preferences}
    Return ONLY a JSON array of 4 meals (Breakfast, Lunch, Dinner, Snack) with these fields:
    [
        {
            "meal": "Breakfast",
            "foodName": "string",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number,
            "reason": "Why this is good for the target"
        }
    ]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (e) {
        console.error("Meal Plan Error:", text);
        return [];
    }
};
