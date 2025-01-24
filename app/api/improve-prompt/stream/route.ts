import { NextResponse } from "next/server"
import OpenAI from "openai"
import { IMPROVEMENT_PROMPT } from "@/app/constants/prompts"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const promptId = searchParams.get("id")
  const userPrompt = searchParams.get("prompt")

  if (!promptId || !userPrompt) {
    return new NextResponse("Missing prompt ID or prompt text", { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  try {
    // Phase 1: Stream the improvement analysis
    await writer.write(encoder.encode(`data: {"phase": 1, "status": "analyzing"}\n\n`))
    
    const phase1Completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: IMPROVEMENT_PROMPT + userPrompt }],
      model: "gpt-4-turbo-preview",
      stream: true,
    })

    // Collect Phase 1 response while streaming
    let fullPhase1Response = ""
    for await (const chunk of phase1Completion) {
      const content = chunk.choices[0]?.delta?.content || ""
      fullPhase1Response += content
      // Stream each chunk immediately
      await writer.write(encoder.encode(`data: ${content}\n\n`))
    }

    // Phase 2: Send the entire Phase 1 response back to OpenAI as a new prompt
    await writer.write(encoder.encode(`data: {"phase": 2, "status": "improving"}\n\n`))

    const phase2Completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant. Take the following prompt improvement analysis and provide a direct, clear response as if you were answering the original prompt. Do not include any analysis or meta-commentary, just provide the response that would best satisfy the improved prompt." 
        },
        { 
          role: "user", 
          content: fullPhase1Response 
        }
      ],
      model: "gpt-4-turbo-preview",
      stream: true,
    })

    // Stream Phase 2 response
    let finalResponse = ""
    for await (const chunk of phase2Completion) {
      const content = chunk.choices[0]?.delta?.content || ""
      finalResponse += content
      // Stream each chunk immediately
      await writer.write(encoder.encode(`data: ${content}\n\n`))
    }

    // Send completion status with the final response
    await writer.write(encoder.encode(`data: {"phase": "completed", "status": "completed", "result": ${JSON.stringify(finalResponse)}}\n\n`))
    await writer.close()
  } catch (error) {
    console.error("Streaming error:", error)
    await writer.write(encoder.encode(`data: {"phase": "completed", "status": "failed"}\n\n`))
    await writer.abort(error as Error)
  }

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
} 