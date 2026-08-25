import * as XLSX from "xlsx";

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*\[\]]/g, " ").trim();
  return (cleaned || "Лист").slice(0, 31);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

type ExcelRow = Record<string, string | number>;

// Строит диапазоны объединения соседних ячеек одной колонки с одинаковым
// значением (например, чтобы название района не повторялось на каждой строке).
function buildMerges(rows: ExcelRow[], mergeColumnKey: string): XLSX.Range[] {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const colIndex = headers.indexOf(mergeColumnKey);
  if (colIndex === -1) return [];

  const merges: XLSX.Range[] = [];
  let start = 0;
  for (let i = 1; i <= rows.length; i++) {
    const same = i < rows.length && rows[i][mergeColumnKey] === rows[start][mergeColumnKey];
    if (!same) {
      if (i - start > 1) {
        merges.push({
          s: { r: start + 1, c: colIndex }, // +1: строка 0 — заголовки
          e: { r: i, c: colIndex },
        });
      }
      start = i;
    }
  }
  return merges;
}

export interface ExcelSheet {
  name: string;
  rows: ExcelRow[];
  mergeColumn?: string; // колонка, соседние одинаковые значения которой объединяются в одну ячейку
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
    if (sheet.mergeColumn) {
      const merges = buildMerges(sheet.rows, sheet.mergeColumn);
      if (merges.length) ws["!merges"] = merges;
    }
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, `${sanitizeFileName(fileBaseName)}.xlsx`);
}

// Один лист, где данные из разных вкладок идут друг под другом (не по разным
// листам); mergeColumn склеивает соседние одинаковые ячейки (например, район).
export function exportRowsToExcel(
  fileBaseName: string,
  sheetName: string,
  rows: ExcelRow[],
  mergeColumn?: string
) {
  exportSheetsToExcel(fileBaseName, [{ name: sheetName, rows, mergeColumn }]);
}
