import { buildPricingMatrix, GridRow } from '@/lib/buildPricingMatrix';

const parseNumber = (value: string): number | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/kg/gi, '').replace(/\s/g, '').replace(',', '.');

  const number = Number(normalized);

  return Number.isNaN(number) ? null : number;
};

const parsePricingRowsFromClipboard = (text: string, matrix: ReturnType<typeof buildPricingMatrix>, zoneCount = 9): GridRow[] | null => {
  const pastedRows = text
    .replace(/\r/g, '')
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.split('\t').map(cell => cell.trim()));

  if (pastedRows.length === 0) {
    return null;
  }

  const normalRows: GridRow[] = [];
  let thanRow: GridRow | null = null;

  pastedRows.forEach(cells => {
    const firstCell = cells[0] ?? '';

    if (!firstCell) {
      const row = matrix.createThanRow();

      for (let zoneIndex = 0; zoneIndex < zoneCount; zoneIndex++) {
        row[`zone${zoneIndex + 1}`] = parseNumber(cells[zoneIndex + 1] ?? '');
      }

      thanRow = row;

      return;
    }

    const weight = parseNumber(firstCell);

    if (weight === null) {
      return;
    }

    const row = matrix.createEmptyRow();

    row.weight = weight;

    for (let zoneIndex = 0; zoneIndex < zoneCount; zoneIndex++) {
      row[`zone${zoneIndex + 1}`] = parseNumber(cells[zoneIndex + 1] ?? '');
    }

    normalRows.push(row);
  });

  if (normalRows.length === 0) {
    return null;
  }

  const lastWeight = normalRows[normalRows.length - 1]?.weight ?? '';

  const finalThanRow = thanRow ?? matrix.createThanRow();

  finalThanRow.weight = `>${lastWeight}`;

  return [...normalRows, finalThanRow];
};

export default parsePricingRowsFromClipboard;
