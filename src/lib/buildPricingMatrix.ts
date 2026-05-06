import type { GridColDef } from '@mui/x-data-grid';

/**
 * DataGrid içerisinde kullanılacak satır tipini temsil eder.
 *
 * @property id Satırın benzersiz kimliği
 * @property weight Ağırlık değeri (kg) veya ">" ifadesi
 * @property [key] Zone fiyatlarını tutan dinamik alanlar (zone1, zone2 ...)
 */
export type GridRow = {
  id: string;
  weight: number | string | null;
  [key: string]: number | string | null;
};

/**
 * buildPricingMatrix fonksiyonunun döndürdüğü yardımcı yapı.
 */
type BuildPricingMatrixReturn = {
  /** DataGrid için oluşturulmuş kolon tanımları */
  columns: GridColDef[];

  /** Boş bir ağırlık satırı oluşturur */
  createEmptyRow: () => GridRow;

  /** ">" (than) satırını oluşturur */
  createThanRow: () => GridRow;

  /**
   * DataGrid satırlarını backend'e gönderilecek zone formatına dönüştürür.
   */
  rowsToZones: (rows: GridRow[]) => {
    number: number;
    than: number;
    prices: { weight: number; price: number }[];
  }[];
};

/**
 * Fiyat matrisi oluşturmak için gerekli kolonları ve yardımcı fonksiyonları üretir.
 *
 * Bu util özellikle **MUI DataGrid kullanılarak oluşturulan kargo fiyat tablolarını**
 * yönetmek için tasarlanmıştır.
 *
 * Üretilen yapı şunları içerir:
 *
 * - DataGrid kolonları (kg + zone kolonları)
 * - Yeni boş satır oluşturma fonksiyonu
 * - "> kg üzeri" satırı oluşturma fonksiyonu
 * - Grid verisini backend formatına çeviren dönüşüm fonksiyonu
 *
 * Grid yapısı örneği:
 *
 * | kg | zone1 | zone2 | zone3 |
 * |----|------|------|------|
 * | 1  | 10   | 12   | 14   |
 * | 5  | 20   | 22   | 24   |
 * | >  | 30   | 32   | 34   |
 *
 * Backend'e dönüşüm örneği:
 *
 * ```ts
 * [
 *   {
 *     number: 1,
 *     than: 30,
 *     prices: [
 *       { weight: 1, price: 10 },
 *       { weight: 5, price: 20 }
 *     ]
 *   }
 * ]
 * ```
 *
 * @param zoneCount Kaç adet bölge (zone) oluşturulacağı. Varsayılan: 9
 * @returns Fiyat matrisi oluşturmak için kolonlar ve yardımcı fonksiyonlar
 */

export const buildPricingMatrix = (zoneCount: number = 9): BuildPricingMatrixReturn => {
  const columns: GridColDef[] = [
    {
      field: 'weight',
      headerName: 'kg',
      flex: 1,
      editable: true,
      type: 'number',
    },
  ];

  for (let i = 1; i <= zoneCount; i++) {
    columns.push({
      field: `zone${i}`,
      headerName: `${i}. Bölge`,
      flex: 1,
      editable: true,
      type: 'number',
    });
  }

  const createEmptyRow = (): GridRow => {
    const row: GridRow = {
      id: crypto.randomUUID(),
      weight: null,
    };

    for (let z = 1; z <= zoneCount; z++) {
      row[`zone${z}`] = null;
    }

    return row;
  };

  const createThanRow = (): GridRow => {
    const row: GridRow = {
      id: 'than',
      weight: '>',
    };

    for (let z = 1; z <= zoneCount; z++) {
      row[`zone${z}`] = null;
    }

    return row;
  };

  const rowsToZones = (rows: GridRow[]) => {
    const weightRows = rows.filter(r => r.id !== 'than');

    const zones = [];

    for (let z = 1; z <= zoneCount; z++) {
      const prices = weightRows
        .filter(r => typeof r.weight === 'number')
        .map(r => ({
          weight: r.weight as number,
          price: Number(r[`zone${z}`] ?? 0),
        }));

      const thanRow = rows.find(r => r.id === 'than');

      const thanPrice = typeof thanRow?.[`zone${z}`] === 'number' ? (thanRow[`zone${z}`] as number) : Number(thanRow?.[`zone${z}`] ?? 0);

      zones.push({
        number: z,
        than: thanPrice,
        prices,
      });
    }

    return zones;
  };

  return {
    columns,
    createEmptyRow,
    createThanRow,
    rowsToZones,
  };
};
