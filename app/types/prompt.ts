export interface Prompt {
  id: number
  user: string
  userprompt: string
  result: string
  createdAt: string
  phase: 1 | 2 | "completed"
  status: "analyzing" | "improving" | "completed" | "failed"
} 