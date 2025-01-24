import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { improvedPrompt } = await req.json()

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant. Take the following prompt improvement analysis and provide a direct, clear response as if you were answering the original prompt. Do not include any analysis or meta-commentary, just provide the response that would best satisfy the improved prompt." 
        },
        { 
          role: "user", 
          content: improvedPrompt 
        }
      ],
      model: "gpt-4-turbo-preview",
    })

    const finalResult = completion.choices[0].message.content

    return NextResponse.json({ finalResult })
  } catch (error) {
    console.error("OpenAI API error:", error)
    return NextResponse.json(
      { error: "Failed to process improved prompt" },
      { status: 500 }
    )
  }
} 