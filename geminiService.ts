import { GoogleGenAI } from "@google/genai";
import { SalesRecord } from "./types";

/**
 * 高級餐飲營運顧問服務 - 使用 Gemini 3 Flash 的即時搜尋能力
 */
export const getAIStaffingAdvice = async (history: SalesRecord[], location: string, targetDate: string, bookings: number) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing. 請在環境變數中設定。");

  const ai = new GoogleGenAI({ apiKey });
  const dateObj = new Date(targetDate);
  const dayName = new Intl.DateTimeFormat('zh-TW', { weekday: 'long' }).format(dateObj);

  const prompt = `
    角色：資深餐飲營運分析師 (Senior Hospitality Ops Analyst)
    目標：分析 "${location}" 地區在 ${targetDate} (${dayName}) 的人力與銷售關聯。
    當前訂位數：${bookings} 位。

    分析任務：
    1. 使用搜尋功能查詢 "${location}" 在該日期的即時天氣預報。
    2. 查詢該日期周邊是否有重大活動（如演唱會、跨年活動、運動賽事）。
    3. 分析交通狀況（是否有封路或運輸施工）。
    4. 根據以上因素評估「散客 (Walk-in)」的增減百分比。

    強制格式：
    最後必須附帶一個足跡乘數：[FOOTFALL_INDEX: X.X]
    - 1.0 = 常態
    - < 1.0 = 預期人流減少 (如：暴雨)
    - > 1.0 = 預期人流增加 (如：周邊有活動)

    報告結構請包含：
    [ENVIRONMENT] 環境與天氣感官。
    [LOGISTICS] 交通與可達性。
    [OPPORTUNITIES] 潛在增收機會點。
    [TACTICAL_ADVICE] GM 戰術建議（具體的人力配置調整）。

    語氣：專業、銳利、數據導向。
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
    throw new Error(error.message || "AI 服務暫時無法連線。");
  }
};
