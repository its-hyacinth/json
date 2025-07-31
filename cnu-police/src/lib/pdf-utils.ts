export interface PDFExportOptions {
  title: string
  subtitle?: string
  filename?: string
  data: any[]
  columns: { header: string; dataKey: string; width?: number }[]
}

export class PrintExporter {
  private static formatDate(value: any): string {
    if (!value) return 'N/A';
    
    try {
      // If it's already a Date object
      if (value instanceof Date) {
        return value.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // If it's a date string that can be parsed
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // If it's a date-time string
      if (typeof value === 'string' && value.includes('T')) {
        const dt = new Date(value);
        return dt.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Fallback to string representation
      return String(value);
    } catch (e) {
      return String(value);
    }
  }

  private static formatDateTime(value: any): string {
    if (!value) return 'N/A';
    
    try {
      const date = value instanceof Date ? value : new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      return String(value);
    } catch (e) {
      return String(value);
    }
  }

  static exportTable(options: PDFExportOptions) {
    const { title, subtitle, data, columns } = options
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      console.error('Could not open print window')
      return
    }

    // Create HTML content
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; font-size: 18px; margin-bottom: 5px; }
          h2 { color: #666; font-size: 14px; margin-top: 0; margin-bottom: 20px; }
          .date { font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #428bca; color: white; text-align: left; padding: 8px; font-weight: bold; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f5f5f5; }
          .footer { font-size: 10px; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
    `

    if (subtitle) {
      html += `<h2>${subtitle}</h2>`
    }

    // Add current date and time
    const now = new Date()
    html += `<div class="date">Generated on: ${this.formatDateTime(now)}</div>`

    // Start table
    html += `<table>
      <thead>
        <tr>`

    // Add table headers
    columns.forEach(col => {
      html += `<th>${col.header}</th>`
    })

    html += `</tr>
      </thead>
      <tbody>`

    // Add table rows
    data.forEach(item => {
      html += `<tr>`
      
      columns.forEach(col => {
        const value = item[col.dataKey]
        let displayValue = 'N/A'
        
        // Handle different data types
        if (value === null || value === undefined) {
          displayValue = 'N/A'
        } else if (typeof value === 'boolean') {
          displayValue = value ? 'Yes' : 'No'
        } else if (col.header.toLowerCase().includes('date') || 
                  col.dataKey.toLowerCase().includes('date')) {
          displayValue = this.formatDate(value)
        } else if (col.header.toLowerCase().includes('time') || 
                   col.dataKey.toLowerCase().includes('time')) {
          displayValue = this.formatDateTime(value)
        } else if (typeof value === 'object' && value.name) {
          displayValue = value.name
        } else if (typeof value === 'object' && value.first_name && value.last_name) {
          displayValue = `${value.first_name} ${value.last_name}`
        } else {
          displayValue = String(value)
        }
        
        html += `<td>${displayValue}</td>`
      })
      
      html += `</tr>`
    })

    // Close table and add footer
    html += `</tbody>
      </table>
      <div class="footer">Printed on ${this.formatDateTime(now)}</div>
      </body>
      </html>`

    // Write content to the new window
    printWindow.document.write(html)
    printWindow.document.close()

    // Trigger print dialog after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  static exportCards(options: {
    title: string
    subtitle?: string
    data: any[]
    cardRenderer: (item: any) => string
  }) {
    const { title, subtitle, data, cardRenderer } = options
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      console.error('Could not open print window')
      return
    }

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; font-size: 18px; margin-bottom: 5px; }
          h2 { color: #666; font-size: 14px; margin-top: 0; margin-bottom: 20px; }
          .date { font-size: 12px; margin-bottom: 20px; }
          .card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
          .footer { font-size: 10px; text-align: right; margin-top: 20px; }
          @media print {
            .card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
    `

    if (subtitle) {
      html += `<h2>${subtitle}</h2>`
    }

    const now = new Date()
    html += `<div class="date">Generated on: ${this.formatDateTime(now)}</div>`

    // Add cards
    data.forEach(item => {
      html += `<div class="card">${cardRenderer(item)}</div>`
    })

    // Add footer
    html += `<div class="footer">Printed on ${this.formatDateTime(now)}</div>
      </body>
      </html>`

    printWindow.document.write(html)
    printWindow.document.close()
  }
}

// Utility functions for common export scenarios
export const exportLeaveRequests = (requests: any[]) => {
  PrintExporter.exportTable({
    title: 'Leave Requests Report',
    subtitle: `Total Requests: ${requests.length}`,
    data: requests,
    columns: [
      { header: 'Employee', dataKey: 'user' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Start Date', dataKey: 'start_date' },
      { header: 'End Date', dataKey: 'end_date' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Submitted', dataKey: 'created_at' },
    ]
  })
}

export const exportOvertimeRequests = (requests: any[]) => {
  PrintExporter.exportTable({
    title: 'Overtime Requests Report',
    subtitle: `Total Requests: ${requests.length}`,
    data: requests,
    columns: [
      { header: 'ID', dataKey: 'id' },
      { header: 'Assigned To', dataKey: 'assigned_employee' },
      { header: 'Date', dataKey: 'overtime_date' },
      { header: 'Time', dataKey: 'start_time' },
      { header: 'Hours', dataKey: 'overtime_hours' },
      { header: 'Type', dataKey: 'overtime_type' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Requested By', dataKey: 'requester' },
    ]
  })
}

export const exportTrainingRequests = (requests: any[]) => {
  PrintExporter.exportTable({
    title: 'Training Requests Report',
    subtitle: `Total Requests: ${requests.length}`,
    data: requests,
    columns: [
      { header: 'Employee', dataKey: 'user' },
      { header: 'Training Title', dataKey: 'training_title' },
      { header: 'Provider', dataKey: 'training_provider' },
      { header: 'Start Date', dataKey: 'start_date' },
      { header: 'End Date', dataKey: 'end_date' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Priority', dataKey: 'priority' },
    ]
  })
}

export const exportCourtAdminRequests = (requests: any[]) => {
  PrintExporter.exportTable({
    title: 'Court Requests Report',
    subtitle: `Total Requests: ${requests.length}`,
    data: requests,
    columns: [
      { header: 'ID', dataKey: 'id' },
      { header: 'Employee', dataKey: 'creator' },
      { header: 'Court Date', dataKey: 'court_date' },
      { header: 'Time', dataKey: 'court_time' },
      { header: 'Type', dataKey: 'court_type' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Created Date', dataKey: 'created_at' },
    ]
  })
}

export const exportCourtEmpRequests = (requests: any[]) => {
  PrintExporter.exportTable({
    title: 'Court Requests Report',
    subtitle: `Total Requests: ${requests.length}`,
    data: requests,
    columns: [
      { header: 'ID', dataKey: 'id' },
      { header: 'Employee', dataKey: 'employee' },
      { header: 'Court Date', dataKey: 'court_date' },
      { header: 'Time', dataKey: 'court_time' },
      { header: 'Type', dataKey: 'court_type' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Created Date', dataKey: 'created_at' },
    ]
  })
}