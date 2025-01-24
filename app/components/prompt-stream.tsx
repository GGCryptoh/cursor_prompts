"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Prompt } from "@/app/types/prompt"

interface PromptStreamProps {
  selectedPrompt: Prompt | null
  onUpdate?: (prompt: Prompt) => void
}

export function PromptStream({ selectedPrompt, onUpdate }: PromptStreamProps) {
  const [streamedContent, setStreamedContent] = useState("")

  useEffect(() => {
    if (!selectedPrompt) return

    // Reset content when prompt changes
    setStreamedContent("")

    if (selectedPrompt.status !== "completed" && selectedPrompt.status !== "failed") {
      // Set up event source for streaming
      const eventSource = new EventSource(
        `/api/improve-prompt/stream?id=${selectedPrompt.id}&prompt=${encodeURIComponent(selectedPrompt.userprompt)}`
      )

      eventSource.onmessage = (event) => {
        try {
          // Check if the data is a phase/status update
          const data = JSON.parse(event.data)
          if (data.phase !== undefined && data.status !== undefined && onUpdate) {
            // Clear streamed content when moving to phase 2
            if (data.phase === 2) {
              setStreamedContent("")
            }
            onUpdate({
              ...selectedPrompt,
              phase: data.phase,
              status: data.status,
              // Update result if provided in the status update
              ...(data.result ? { result: data.result } : {})
            })
          } else {
            // If it's not JSON, treat it as content
            setStreamedContent(prev => prev + event.data)
          }
        } catch {
          // If it's not JSON, treat it as content
          setStreamedContent(prev => prev + event.data)
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
      }

      return () => {
        eventSource.close()
      }
    }
  }, [selectedPrompt, onUpdate])

  if (!selectedPrompt) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Select a prompt to view details</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Prompt Details</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{selectedPrompt.userprompt}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {selectedPrompt.phase === "completed" ? "Complete" : `Phase ${selectedPrompt.phase}`}
          </Badge>
          <Badge 
            variant={
              selectedPrompt.status === 'completed' ? 'default' :
              selectedPrompt.status === 'failed' ? 'destructive' :
              'secondary'
            }
          >
            {selectedPrompt.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
          {selectedPrompt.status === "failed" ? (
            "Failed to improve prompt. Please try again."
          ) : selectedPrompt.phase === "completed" ? (
            selectedPrompt.result
          ) : (
            streamedContent || getStatusMessage(selectedPrompt.status)
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "analyzing":
      return "Analyzing and improving your prompt..."
    case "improving":
      return "Processing improved prompt..."
    default:
      return "Processing..."
  }
} 