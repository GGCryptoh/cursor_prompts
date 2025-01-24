"use client"

import { useState, useEffect } from "react"
import { Prompt } from "./types/prompt"
import { PromptForm } from "./components/prompt-form"
import { PromptTable } from "./components/prompt-table"
import { PromptStream } from "./components/prompt-stream"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function Dashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const { toast } = useToast()

  const itemsPerPage = 10
  const totalPages = Math.ceil(prompts.length / itemsPerPage)
  const paginatedPrompts = prompts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    // Load prompts from localStorage
    const storedPrompts = JSON.parse(localStorage.getItem('prompts') || '[]')
    setPrompts(storedPrompts)
  }, [])

  // Update selected prompt when prompts change
  useEffect(() => {
    if (selectedPrompt) {
      const updatedPrompt = prompts.find(p => p.id === selectedPrompt.id)
      if (updatedPrompt) {
        setSelectedPrompt(updatedPrompt)
      }
    }
  }, [prompts, selectedPrompt])

  function handlePromptSubmit(prompt: Prompt) {
    setPrompts(prevPrompts => {
      const newPrompts = prevPrompts.map(p => 
        p.id === prompt.id ? prompt : p
      )
      if (!prevPrompts.find(p => p.id === prompt.id)) {
        newPrompts.unshift(prompt)
        // Auto-select new prompts
        setSelectedPrompt(prompt)
      }
      localStorage.setItem('prompts', JSON.stringify(newPrompts))
      return newPrompts
    })
  }

  // Reuse the same handler for retries
  const handleRetry = handlePromptSubmit

  function handleDelete(promptId: number) {
    setPrompts(prevPrompts => {
      const newPrompts = prevPrompts.filter(p => p.id !== promptId)
      localStorage.setItem('prompts', JSON.stringify(newPrompts))
      if (selectedPrompt?.id === promptId) {
        setSelectedPrompt(null)
      }
      return newPrompts
    })
  }

  function handlePromptSelect(prompt: Prompt) {
    setSelectedPrompt(prompt)
  }

  function handleClearStorage() {
    localStorage.removeItem('prompts')
    setPrompts([])
    setSelectedPrompt(null)
    setCurrentPage(1)
    toast({
      title: "Storage Cleared",
      description: "All prompts have been cleared from local storage",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">LMAITFY Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearStorage}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Storage
        </Button>
      </div>

      <PromptForm onPromptSubmit={handlePromptSubmit} />
      <PromptTable 
        prompts={paginatedPrompts} 
        onRetry={handleRetry} 
        onDelete={handleDelete}
        onSelect={handlePromptSelect}
        selectedPromptId={selectedPrompt?.id}
      />

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <PromptStream 
        selectedPrompt={selectedPrompt} 
        onUpdate={handlePromptSubmit}
      />
    </div>
  )
}

