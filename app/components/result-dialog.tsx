"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, ExternalLink, RotateCw, Trash2 } from "lucide-react"
import { Prompt } from "@/app/types/prompt"

interface ResultDialogProps {
  prompt: Prompt
  onRetry?: (prompt: Prompt) => void
  onDelete?: (promptId: number) => void
}

export function ResultDialog({ prompt, onRetry, onDelete }: ResultDialogProps) {
  const { toast } = useToast()

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Prompt copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  function openChatGPT(text: string) {
    copyToClipboard(text)
    window.open("https://chat.openai.com", "_blank")
  }

  function handleRetry() {
    if (onRetry) {
      const retryPrompt: Prompt = {
        id: Date.now(),
        user: prompt.user,
        userprompt: prompt.userprompt,
        result: "",
        createdAt: new Date().toISOString(),
        status: "processing",
        phase: 1
      }
      onRetry(retryPrompt)
    }
  }

  function handleDelete() {
    if (onDelete) {
      onDelete(prompt.id)
      toast({
        title: "Deleted",
        description: "Prompt deleted successfully",
      })
    }
  }

  if (prompt.status === "failed") {
    return (
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">View Error</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-red-500">Failed to improve prompt. Please try again.</p>
            </div>
          </DialogContent>
        </Dialog>
        {onRetry && (
          <Button variant="outline" size="icon" onClick={handleRetry}>
            <RotateCw className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    )
  }

  if (prompt.status === "processing" || prompt.status === "analyzing" || prompt.status === "improving") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button disabled>Processing...</Button>
        </DialogTrigger>
      </Dialog>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">View Improved Prompt</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[825px]">
          <DialogHeader>
            <DialogTitle>Improved Prompt</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="text-sm text-gray-500 whitespace-pre-wrap">{prompt.result}</div>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => copyToClipboard(prompt.result)} size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button onClick={() => openChatGPT(prompt.result)} size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in ChatGPT
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {onDelete && (
        <Button variant="outline" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  )
} 