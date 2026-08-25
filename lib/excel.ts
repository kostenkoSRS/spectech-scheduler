import * as XLSX from "xlsx";

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*\[\]]/g, " ").trim();
  return (cleaned || "Лист").slice(0, 31);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

export interface ExcelSheet {
  name: string;
  rows: Record<string, string | number>[];
}

export function exportSheetsToExcel(fileBaseName: string, sheets: ExcelSheet[]) {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  for (const sheet of sheets) {
    let sheetName = sanitizeSheetName(sheet.name);
    let suffix = 2;
    while (usedNames.has(sheetName)) {
      sheetName = `${sanitizeSheetName(sheet.name).slice(0, 28)} ${suffix}`;
      suffix += 1;
    }
    usedNames.add(sheetName);

    const ws = XLSX.utils.json_to_sheet(sheet.rows.length ? sheet.rows : [{ " ": "" }]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, `${sanitizeFileName(fileBaseName)}.xlsx`);
}
