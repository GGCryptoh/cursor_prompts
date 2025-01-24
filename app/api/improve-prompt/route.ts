import { NextResponse } from "next/server"
import OpenAI from "openai"
import { IMPROVEMENT_PROMPT } from "@/app/constants/prompts"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { prompt } = await req.json()

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: IMPROVEMENT_PROMPT + prompt }],
      model: "gpt-4-turbo-preview",
    })

    const improvedPrompt = completion.choices[0].message.content

    return NextResponse.json({ improvedPrompt })
  } catch (error) {
    console.error("OpenAI API error:", error)
    return NextResponse.json(
      { error: "Failed to improve prompt" },
      { status: 500 }
    )
  }
}

