const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizeAnswers(answers) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Given the following user answers, summarize their emotional and behavioral traits in one sentence:\n\n${answers.join(". ")}.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const summary = response.text();

  return summary;
}

module.exports = summarizeAnswers;
