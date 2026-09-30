import * as XLSX from "xlsx-js-style";

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

export interface GridCell {
  value: string;
  bgHex?: string; // без "#", например "FDE68A"
  bold?: boolean;
  header?: boolean;
}

export interface GridMerge {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

// Экспорт "как на сайте" — таблица-календарь с закраской ячеек, как в интерфейсе.
export function exportGridToExcel(
  fileBaseName: string,
  sheetName: string,
  rows: GridCell[][],
  merges: GridMerge[] = [],
  colWidths?: number[]
) {
  const aoa = rows.map((row) => row.map((c) => c.value));
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      const addr = XLSX.utils.encode_cell({ r, c });
      const style: Record<string, unknown> = {
        alignment: { vertical: "top", wrapText: true },
      };
      if (cell.bgHex) {
        style.fill = { patternType: "solid", fgColor: { rgb: cell.bgHex } };
      }
      if (cell.header) {
        style.font = { bold: true };
        style.fill = { patternType: "solid", fgColor: { rgb: "E0F2FE" } };
      }
      if (cell.bold) {
        style.font = { ...(style.font as object), bold: true };
      }
      if (ws[addr]) {
        ws[addr].s = style;
      }
    });
  });

  if (merges.length) ws["!merges"] = merges;
  if (colWidths) ws["!cols"] = colWidths.map((w) => ({ wch: w }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheetName));
  XLSX.writeFile(wb, `${sanitizeFileName(fileBaseName)}.xlsx`);
}
