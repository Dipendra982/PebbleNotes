import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateNoteDescription = async (title, subject) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, compelling marketing description (2-3 sentences) for a college student's study guide titled "${title}" in the subject of "${subject}". Focus on the value and clarity of the notes.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "High-quality notes for effective learning.";
  }
};

export const generateStudyInsights = async (title, description) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this study material description: "${description}" for the topic "${title}", provide 3 brief bullet points on why this is a must-have for students preparing for exams.`,
    });
    return response.text || "Focuses on core concepts, solved problems, and key diagrams.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Great for exam prep and concept clarity.";
  }
};
