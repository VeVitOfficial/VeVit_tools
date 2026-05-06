import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function generateText(prompt: string): Promise<string> {
  if (!genAI) throw new Error('GEMINI_API_KEY not configured')
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function analyzeImage(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  if (!genAI) throw new Error('GEMINI_API_KEY not configured')
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageBase64, mimeType } },
  ])
  return result.response.text()
}
