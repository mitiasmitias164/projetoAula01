/**
 * Generate CSV content from array of data
 */
export function generateCSV(data: any[], headers: string[]): string {
    const rows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header] ?? ''
                // Escape double quotes and wrap in quotes
                return `"${String(value).replace(/"/g, '""')}"`
            }).join(',')
        )
    ]
    return rows.join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.href = url
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
}

/**
 * Export enrollments to CSV
 */
export function exportEnrollmentsCSV(enrollments: any[], filename: string = 'inscricoes.csv'): void {
    const headers = ['nome', 'email', 'telefone', 'status', 'data_inscricao']
    const csvContent = generateCSV(enrollments, headers)
    downloadCSV(filename, csvContent)
}

/**
 * Export attendance to CSV
 */
export function exportAttendanceCSV(attendance: any[], filename: string = 'presencas.csv'): void {
    const headers = ['nome', 'email', 'presente', 'marcado_em', 'marcado_por']
    const csvContent = generateCSV(attendance, headers)
    downloadCSV(filename, csvContent)
}

/**
 * Export evaluations to CSV
 */
export function exportEvaluationsCSV(evaluations: any[], filename: string = 'avaliacoes.csv'): void {
    const headers = ['nome', 'email', 'nps', 'comentario', 'enviada_em']
    const csvContent = generateCSV(evaluations, headers)
    downloadCSV(filename, csvContent)
}
