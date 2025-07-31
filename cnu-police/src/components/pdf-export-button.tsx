'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { 
  exportLeaveRequests, 
  exportOvertimeRequests, 
  exportTrainingRequests, 
  exportCourtAdminRequests,
  exportCourtEmpRequests
} from '@/lib/pdf-utils'

interface PDFExportButtonProps {
  data: any[]
  type: 'leave' | 'overtime' | 'training' | 'court-admin' | 'court-employee'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function PDFExportButton({ 
  data, 
  type, 
  size = 'default',
  className 
}: PDFExportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) {
      alert('No data available to export')
      return
    }

    try {
      switch (type) {
        case 'leave':
          exportLeaveRequests(data)
          break
        case 'overtime':
          exportOvertimeRequests(data)
          break
        case 'training':
          exportTrainingRequests(data)
          break
        case 'court-admin':
          exportCourtAdminRequests(data)
          break
        case 'court-employee':
          exportCourtEmpRequests(data)
          break
        default:
          console.error('Unknown export type:', type)
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Failed to export. Please try again.')
    }
  }

  return (
    <Button 
      onClick={handleExport}
      variant="outline" 
      size={size}
      className={`gap-2 ${className || ''}`}
      disabled={data.length === 0}
    >
      <FileDown className="h-4 w-4" />
      Print Data
    </Button>
  )
}