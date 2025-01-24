import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Prompt } from "@/app/types/prompt"
import { ResultDialog } from "./result-dialog"
import { Badge } from "@/components/ui/badge"

interface PromptTableProps {
  prompts: Prompt[]
  onRetry: (prompt: Prompt) => void
  onDelete: (promptId: number) => void
  onSelect: (prompt: Prompt) => void
  selectedPromptId?: number
}

export function PromptTable({ prompts, onRetry, onDelete, onSelect, selectedPromptId }: PromptTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Original Prompt</TableHead>
          <TableHead>Phase</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prompts.map((prompt) => (
          <TableRow 
            key={prompt.id}
            className={`cursor-pointer ${selectedPromptId === prompt.id ? 'bg-muted' : ''}`}
            onClick={() => onSelect(prompt)}
          >
            <TableCell>{prompt.user}</TableCell>
            <TableCell>{prompt.userprompt}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {prompt.phase === "completed" ? "Complete" : `Phase ${prompt.phase}`}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={
                prompt.status === 'completed' ? 'default' :
                prompt.status === 'failed' ? 'destructive' :
                'secondary'
              }>
                {prompt.status}
              </Badge>
            </TableCell>
            <TableCell className="text-xs whitespace-nowrap">{new Date(prompt.createdAt).toLocaleString()}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <ResultDialog prompt={prompt} onRetry={onRetry} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 