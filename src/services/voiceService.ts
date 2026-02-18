import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIAnalysisResult } from './aiService';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const startRecording = async (): Promise<Audio.Recording | undefined> => {
    try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') return;

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        return recording;
    } catch (err) {
        console.error('Failed to start recording', err);
    }
};

export const stopRecording = async (recording: Audio.Recording): Promise<string | undefined> => {
    try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (!uri) return;

        const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });
        return base64Audio;
    } catch (err) {
        console.error('Failed to stop recording', err);
    }
};

export const analyzeAudioMeal = async (base64Audio: string): Promise<AIAnalysisResult> => {
    if (!API_KEY) {
        throw new Error("Gemini API key not configured.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Listen to this audio description of a person talking about what they ate. 
  Extract the food items and provide nutritional information.
  Return ONLY a JSON object with the following fields:
  {
      "foodName": "Summary of food items mentioned",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "confidence": number (0-1)
  }`;

    const result = await model.generateContent([
        {
            inlineData: {
                data: base64Audio,
                mimeType: "audio/m4a", // expo-av default on most platforms
            },
        },
        prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse AI response");
    } catch (e) {
        console.error("AI Audio Analysis Error:", text);
        throw new Error("Failed to analyze audio content.");
    }
};
