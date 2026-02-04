import { GoogleGenAI } from "@google/genai";
import { SalesRecord } from "../types";

/**
 * Service to consult AI for strategic staffing advice based on location, bookings, and external grounding.
 */
export const getAIStaffingAdvice = async (history: SalesRecord[], location: string, targetDate: string, bookings: number) => {
  // 使用 Vite define 注入的環境變數
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure API_KEY is set in environment variables.");
  }

  // 必須使用具名參數 { apiKey } 初始化
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const dateObj = new Date(targetDate);
  const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(dateObj);

  const prompt = `
    Role: Strategic Operations Consultant for Hospitality.
    Location: "${location}"
    Service Date: ${targetDate} (${dayName})
    Bookings: ${bookings} guests.

    Analyze real-time events, weather, and transport to provide a staffing prediction index for this restaurant location.

    CRITICAL INSTRUCTION:
    At the very end of your response, you MUST include a footfall multiplier tag in this exact format: [FOOTFALL_INDEX: X.X]
    - 1.0 = Normal (Average traffic)
    - 0.5 - 0.9 = Quieter than usual (Rain, strikes, no events)
    - 1.1 - 1.5 = Busier than usual (Sunny, festivals, concerts)

    Analysis Sections:
    [WEATHER] Forecast and outdoor impact.
    [TRANSPORT] Local status and disruptions.
    [EVENTS] Major nearby events with exact times.
    [ADVICE] Specific FOH staffing recommendation.

    Style: Professional, sharp, bullet points (•) only. NO bold markers (**).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    // 嚴格遵守 SDK 規範：.text 是屬性，不是方法
    const text = response.text;
    if (!text) throw new Error("No strategic signal received from the engine.");

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
    throw new Error(error.message || "Strategic engine synchronization failed.");
  }
};
