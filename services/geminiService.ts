
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const enhanceCode = async (code: string, instruction: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve the following code snippet based on this instruction: "${instruction}". 
      Return ONLY the improved code without any markdown formatting or explanation.
      
      Code:
      ${code}`,
    });
    return response.text?.trim() || code;
  } catch (error) {
    console.error("Gemini Error:", error);
    return code;
  }
};

export const detectLanguage = async (code: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following code snippet and determine the programming language. 
        Return ONLY the language name in lowercase (e.g., 'javascript', 'typescript', 'python', 'rust').
        
        Code:
        ${code}`,
      });
      return response.text?.trim().toLowerCase() || 'javascript';
    } catch (error) {
      return 'javascript';
    }
  };
