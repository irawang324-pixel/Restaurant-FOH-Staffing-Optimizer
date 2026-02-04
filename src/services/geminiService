
import { GoogleGenAI } from "@google/genai";
import { SalesRecord } from "../types";

/**
 * Service to consult AI for strategic staffing advice.
 * Uses gemini-3-flash-preview for high performance and live grounding.
 */
export const getAIStaffingAdvice = async (history: SalesRecord[], location: string, targetDate: string, bookings: number) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing from the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const dateObj = new Date(targetDate);
  const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(dateObj);

  const prompt = `
    Role: Senior Hospitality Operations Consultant.
    Context: Analyze staffing needs for a restaurant in "${location}" for ${targetDate} (${dayName}).
    Confirmed Bookings: ${bookings} guests.

    Tasks:
    1. Search for local events (concerts, games), weather forecast, and transport issues near ${location}.
    2. Evaluate how these factors will impact "Walk-in" traffic.
    3. Provide a clear FOH (Front of House) staffing strategy.

    MANDATORY: You must conclude your report with a footfall index multiplier in this format: [FOOTFALL_INDEX: X.X]
    - 1.0 = Baseline
    - < 1.0 = Reduced traffic expected
    - > 1.0 = Surge expected

    Sections:
    [ENVIRONMENT] Weather & Vibes.
    [LOGISTICS] Transport & Accessibility.
    [OPPORTUNITIES] Events or holidays that could drive sales.
    [TACTICAL_ADVICE] Staffing and service prep recommendations.

    Tone: Sharp, data-driven, executive summary style.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Strategic analysis failed to generate.");

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
    console.error("AI Strategic Error:", error);
    throw new Error(error.message || "The intelligence engine is currently recalibrating.");
  }
};
