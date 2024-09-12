import ExcelJS from 'exceljs';

type RowData = { [key: string]: any };
type Columns = { header: string; key: string }[];

interface Options {
  columns: Columns;
  data: RowData[];
  sheetName: string;
  format: string;
  filename: string;
}

export const downloadExcel = async (options: Options) => {
  const { columns, data, sheetName, format, filename } = options;
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet(sheetName);
  const worksheet = workbook.getWorksheet(sheetName);

  if (worksheet) {
    worksheet.columns = columns;
    worksheet.addRows(data);
  }

  const uint8Array =
    format === 'xlsx'
      ? await workbook.xlsx.writeBuffer() //xlsxの場合
      : await workbook.csv.writeBuffer(); //csvの場合
  const blob = new Blob([uint8Array], { type: 'application/octet-binary' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.' + format; //フォーマットによってファイル拡張子を変えている
  a.click();
  a.remove();
};
