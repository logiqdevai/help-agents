const escapeCell = (cell: string | number | null | undefined): string => {
  const text = cell === null || cell === undefined ? "" : String(cell)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Saves `rows` (header first) as a CSV file through the browser; opens cleanly in Excel. */
export function downloadCsv(filename: string, rows: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>) {
  const body = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")
  const blob = new Blob([`﻿${body}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
