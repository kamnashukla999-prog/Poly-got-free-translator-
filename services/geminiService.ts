
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate accurately from ${sourceLang} to ${targetLang}. 
        If input is Hindi, output English. If input is English, output Hindi.
        Input: "${text}"
        Return ONLY the translated text. Do not provide pronunciation or explanation.`,
        config: { temperature: 0.1 }
      });
      return response.text || "Translation failed.";
    } catch (error) {
      console.error("Translation Error:", error);
      throw error;
    }
  }

  async *translateStream(text: string, sourceLang: string, targetLang: string) {
    try {
      const result = await this.ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: `Translate from ${sourceLang} to ${targetLang}. 
        IMPORTANT: If user types Hindi (Devanagari), the target MUST be English. 
        If user types English, the target MUST be Hindi.
        Return ONLY the translated text. 
        Text: "${text}"`,
        config: { temperature: 0.1 }
      });
      for await (const chunk of result) {
        yield chunk.text;
      }
    } catch (error) {
      console.error("Streaming Translation Error:", error);
      throw error;
    }
  }

  async generateImage(prompt: string, styleSuffix: string, bgSuffix: string, aspectRatio: string): Promise<string | undefined> {
    try {
      const fullPrompt = `${prompt}. ${styleSuffix}. ${bgSuffix}`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: {
          imageConfig: { aspectRatio: aspectRatio as any }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return undefined;
    } catch (error) {
      console.error("Image Generation Error:", error);
      return undefined;
    }
  }

  async detectLanguage(text: string): Promise<string | undefined> {
    if (!text || text.length < 3) return undefined;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Identify if the following text is "Hindi" or "English". Respond with only the language name. Text: "${text.substring(0, 100)}"`,
        config: { temperature: 0 }
      });
      return response.text?.trim();
    } catch (error) {
      return undefined;
    }
  }

  async generateSpeech(text: string, lang: string): Promise<string | undefined> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      return undefined;
    }
  }
}

export const geminiService = new GeminiService();
