import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "./src/config.js";

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello",
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
