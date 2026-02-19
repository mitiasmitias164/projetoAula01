import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, `${filename}.xlsx`)
    return true
}

export const exportToPDF = (turma: any, inscritos: any[]) => {
    const doc = new jsPDF()

    // Colors
    const PRIMARY_COLOR: [number, number, number] = [22, 163, 74] // green-600
    const BG_DARK: [number, number, number] = [10, 10, 11] // zinc-950
    const TEXT_GRAY: [number, number, number] = [107, 114, 128] // gray-500
    const TEXT_DARK: [number, number, number] = [17, 24, 39] // gray-900

    // Header Background
    doc.setFillColor(...BG_DARK)
    doc.rect(0, 0, 210, 30, 'F')

    // Title
    doc.setTextColor(255, 255, 255) // White
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(`Relatório da Turma`, 14, 18)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${turma.campus?.nome || 'Campus não informado'}`, 14, 24)

    // Reset basics
    doc.setTextColor(...TEXT_DARK)
    doc.setFontSize(10)
    let yPos = 40

    // Stats Section (Mocking the Cards)
    const drawStatCard = (label: string, value: string, x: number, y: number, width: number, accent = false) => {
        doc.setFillColor(249, 250, 251) // gray-50
        doc.setDrawColor(229, 231, 235) // gray-200
        doc.roundedRect(x, y, width, 20, 2, 2, 'FD')

        doc.setTextColor(...TEXT_GRAY)
        doc.setFontSize(8)
        doc.text(label, x + 4, y + 6)

        doc.setTextColor(accent ? PRIMARY_COLOR[0] : TEXT_DARK[0], accent ? PRIMARY_COLOR[1] : TEXT_DARK[1], accent ? PRIMARY_COLOR[2] : TEXT_DARK[2])
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(value, x + 4, y + 14)
        doc.setFont('helvetica', 'normal')
    }

    const vagasOcupadas = inscritos.filter((i: any) => i.status === 'ATIVA').length
    const ocupacao = Math.round((vagasOcupadas / turma.capacidade) * 100)

    drawStatCard('Status', turma.status, 14, yPos, 40, turma.status === 'ABERTA')
    drawStatCard('Ocupação', `${vagasOcupadas} / ${turma.capacidade} (${ocupacao}%)`, 58, yPos, 50)
    drawStatCard('Horário', `${turma.hora_inicio.slice(0, 5)} - ${turma.hora_fim.slice(0, 5)}`, 112, yPos, 60)

    yPos += 30

    // Class Details Section
    doc.setFontSize(14)
    doc.setTextColor(...TEXT_DARK)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados da Turma', 14, yPos)
    yPos += 10

    const details = [
        ['Data', new Date(turma.data).toLocaleDateString(), 'Local', turma.local],
        ['Capacidade Total', `${turma.capacidade} alunos`, 'Campus', turma.campus?.nome]
    ]

    details.forEach(row => {
        doc.setFontSize(9)
        doc.setTextColor(...TEXT_GRAY)
        doc.text(row[0], 14, yPos) // Label 1
        doc.text(row[2], 112, yPos) // Label 2

        doc.setFontSize(10)
        doc.setTextColor(...TEXT_DARK)
        doc.text(row[1], 14, yPos + 5) // Value 1
        doc.text(row[3], 112, yPos + 5) // Value 2

        // Horizontal Line
        doc.setDrawColor(243, 244, 246)
        doc.line(14, yPos + 8, 196, yPos + 8)

        yPos += 12
    })

    yPos += 10

    // Participants Table
    doc.setFontSize(14)
    doc.setTextColor(...TEXT_DARK)
    doc.setFont('helvetica', 'bold')
    doc.text('Participantes Inscritos', 14, yPos)
    yPos += 6

    const tableColumn = ["Nome", "Contato", "Status", "Data Inscrição"]
    const tableRows = inscritos.map((inscricao: any) => [
        inscricao.user?.nome || 'N/A',
        `${inscricao.user?.email || ''}\n${inscricao.user?.telefone || ''}`,
        inscricao.status,
        new Date(inscricao.created_at).toLocaleDateString()
    ])

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: 'grid',
        headStyles: {
            fillColor: BG_DARK,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: TEXT_DARK,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 50 }, // Nome
            1: { cellWidth: 80 }, // Contato
            2: { cellWidth: 30, halign: 'center' }, // Status
            3: { cellWidth: 30, halign: 'center' }  // Data
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251]
        }
    })

    const filename = `relatorio_turma_${turma.campus?.nome.replace(/\s+/g, '_').toLowerCase()}_${new Date(turma.data).toISOString().split('T')[0]}.pdf`
    doc.save(filename)
    return true
}
