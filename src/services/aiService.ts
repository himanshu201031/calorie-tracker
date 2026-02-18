import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIAnalysisResult {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
}

export const analyzeImage = async (base64Image: string): Promise<AIAnalysisResult> => {
    if (!API_KEY) {
        throw new Error("Gemini API key not configured.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this food image and provide nutritional information. 
    Return ONLY a JSON object with the following fields:
    {
        "foodName": "Main food item identified",
        "calories": number,
        "protein": number (grams),
        "carbs": number (grams),
        "fat": number (grams),
        "confidence": number (0-1)
    }`;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: base64Image,
                mimeType: "image/jpeg",
            },
        },
    ]);

    const response = await result.response;
    const text = response.text();

    try {
        // Find the JSON block in the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse AI response");
    } catch (e) {
        console.error("AI Analysis Error:", text);
        throw new Error("Failed to analyze image content.");
    }
};
