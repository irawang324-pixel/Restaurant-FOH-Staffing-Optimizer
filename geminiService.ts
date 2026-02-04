import { GoogleGenAI } from "@google/genai";
import { SalesRecord } from "./types";

/**
 * Senior Hospitality Operations Consultant Service - Using Gemini 3 Flash with Search Grounding
 */
export const getAIStaffingAdvice = async (history: SalesRecord[], location: string, targetDate: string, bookings: number) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Please check your environment variables.");

  const ai = new GoogleGenAI({ apiKey });
  const dateObj = new Date(targetDate);
  const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(dateObj);

  const prompt = `
    Role: Senior Hospitality Operations Analyst
    Goal: Analyze the correlation between staffing and sales for a venue in "${location}" on ${targetDate} (${dayName}).
    Current Bookings: ${bookings} guests.

    Analysis Tasks:
    1. Use Google Search to check live weather forecasts for ${location} on that date.
    2. Check for major local events (concerts, festivals, sports) near the venue.
    3. Analyze transportation logistics (road closures, rail strikes, or high traffic expected).
    4. Estimate the percentage change in "Walk-in" traffic based on these environmental factors.

    MANDATORY FORMAT:
    You must include a footfall index multiplier at the end: [FOOTFALL_INDEX: X.X]
    - 1.0 = Baseline (Neutral)
    - < 1.0 = Expected reduction (e.g., extreme storms, transport failure)
    - > 1.0 = Expected surge (e.g., neighboring event, ideal weather)

    Report Structure:
    [ENVIRONMENT] Weather & Atmosphere analysis.
    [LOGISTICS] Access & Transport considerations.
    [OPPORTUNITIES] Revenue driving opportunities or risks.
    [TACTICAL_ADVICE] Strategic staffing adjustments for the GM.

    Tone: Professional, data-driven, and sharp.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }], 
        temperature: 0.6 
      }
    });

    const text = response.text || "";
    const indexMatch = text.match(/\[FOOTFALL_INDEX:\s*(\d+\.?\d*)\]/);
    const footfallIndex = indexMatch ? parseFloat(indexMatch[1]) : 1.0;

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map(chunk => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((s): s is { title: string; uri: string } => s !== null);

    return {
      rawResponse: text.replace(/\[FOOTFALL_INDEX:.*?\]/g, '').trim(),
      sources: sources.slice(0, 5),
      footfallIndex
    };
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error(error.message || "AI Service currently unavailable.");
  }
};
