"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Prompt } from "@/app/types/prompt"

interface PromptFormProps {
  onPromptSubmit: (prompt: Prompt) => void
}

export function PromptForm({ onPromptSubmit }: PromptFormProps) {
  const [newPrompt, setNewPrompt] = useState("")
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newPrompt.trim()) return

    // Create a new prompt entry with processing status
    const newPromptEntry: Prompt = {
      id: Date.now(),
      user: "geoff",
      userprompt: newPrompt,
      result: "",
      createdAt: new Date().toISOString(),
      status: "analyzing",
      phase: 1
    }

    // Call the parent handler
    onPromptSubmit(newPromptEntry)
    setNewPrompt("")

    try {
      // Phase 1: Get the initial improved prompt
      const phase1Response = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: newPrompt }),
      })

      if (!phase1Response.ok) {
        throw new Error("Failed to improve prompt")
      }

      const phase1Data = await phase1Response.json()
      
      // Update status for Phase 2
      const phase2Entry: Prompt = {
        ...newPromptEntry,
        status: "improving" as const,
        phase: 2 as const
      }
      onPromptSubmit(phase2Entry)

      // Phase 2: Send the improved prompt back to get final result
      const phase2Response = await fetch("/api/improve-prompt/phase2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ improvedPrompt: phase1Data.improvedPrompt }),
      })

      if (!phase2Response.ok) {
        throw new Error("Failed to process improved prompt")
      }

      const phase2Data = await phase2Response.json()

      // Update with final result
      onPromptSubmit({
        ...newPromptEntry,
        result: phase2Data.finalResult,
        status: "completed",
        phase: "completed"
      })

      toast({
        title: "Success",
        description: "Prompt improved successfully",
      })
    } catch (error) {
      // Update the prompt with error status
      onPromptSubmit({
        ...newPromptEntry,
        status: "failed",
        phase: "completed",
        result: "Failed to improve prompt",
      })

      toast({
        title: "Error",
        description: "Failed to improve prompt",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2">
        <Input
          type="text"
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          placeholder="Enter your prompt"
          className="flex-grow"
        />
        <Button type="submit">Improve Prompt</Button>
      </div>
    </form>
  )
} 