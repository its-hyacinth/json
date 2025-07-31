"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, X } from "lucide-react"
import { ChangeEvent } from "react"

interface FilePreviewProps {
  file: File | null
  existingFile?: { path: string; name: string } | null
  onFileChange: (file: File | null) => void
  onRemove?: () => void
  accept?: string
}

export function FilePreview({ file, existingFile, onFileChange, onRemove, accept }: FilePreviewProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0])
    }
  }

  return (
    <div className="space-y-2">
      {file ? (
        <div className="flex items-center gap-2 p-2 border rounded">
          <Paperclip className="h-4 w-4" />
          <span className="text-sm truncate flex-1">{file.name}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => onFileChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : existingFile ? (
        <div className="flex items-center gap-2 p-2 border rounded">
          <Paperclip className="h-4 w-4" />
          <span className="text-sm truncate flex-1">{existingFile.name}</span>
          {onRemove && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input 
            type="file" 
            onChange={handleFileChange} 
            accept={accept}
            className="cursor-pointer"
          />
        </div>
      )}
    </div>
  )
}