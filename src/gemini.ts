import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });

export async function generateStudyPlan(currentProgress: any, subjects: any[]) {
  const prompt = `
    You are an expert Industrial Engineering Academic Advisor.
    Given the current progress of a student and the IE curriculum, generate a personalized study roadmap.
    
    Student Progress: ${JSON.stringify(currentProgress)}
    Curriculum: ${JSON.stringify(subjects.map(s => ({ id: s.id, code: s.code, name: s.name, prerequisites: s.prerequisiteIds })))}
    
    Return a JSON array of steps. Each step should include:
    - title: String (e.g., "Master the Fundamentals")
    - description: String
    - subjects: Array of strings (subject codes)
    - difficulty: "easy" | "medium" | "hard"
    
    Focus on prerequisite satisfaction and logical learning flow.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

export async function askQuestion(question: string, context: string) {
  const prompt = `
    You are an IE Matrix AI Tutor. 
    Question: ${question}
    Context (Subject Information): ${context}
    
    Provide a clear, helpful explanation. Use markdown for formatting.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "Sorry, I couldn't process your request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't process your request.";
  }
}

export async function generateQuiz(subjectName: string) {
  const prompt = `
    Create a 5-question multiple choice quiz for the subject: ${subjectName}.
    The questions should be relevant to Industrial Engineering.
    
    Return a JSON array of objects:
    - question: String
    - options: Array of 4 strings
    - answerIndex: Number (0-3)
    - explanation: String
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
}
