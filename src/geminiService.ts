import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getCurriculumAdvice(userProgress: any, subjects: any[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are an academic advisor for Industrial Engineering students at Cebu Technological University (CTU).
    
    Current Curriculum: ${JSON.stringify(subjects.map(s => ({ code: s.code, name: s.name, year: s.yearLevel, sem: s.semester })))}
    User Progress: ${JSON.stringify(userProgress)}
    
    Based on the student's progress and the curriculum, provide:
    1. A brief encouraging greeting.
    2. 3 specific pieces of advice for their next semester.
    3. Identify any potential prerequisite bottlenecks they should be aware of.
    
    Keep the tone professional, encouraging, and concise. Format the response in Markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I couldn't generate advice at the moment. Please try again later.";
  }
}
