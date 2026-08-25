import Inventory2Icon from '@mui/icons-material/Inventory2';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import CardHeader from './CardHeader';

type Currency = 'USD' | 'EUR' | 'GBP';

type Product = {
  name?: string;
  unitPrice?: number;
  piece?: number;
  gtip?: string;
};

type ContentSectionProps = {
  products?: Product[];
  currency?: Currency;
};

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const getRowTotal = (product: Product) => {
  return (product.unitPrice ?? 0) * (product.piece ?? 0);
};

const formatPrice = (value: number, currency?: Currency) => {
  const symbol = currency ? currencySymbols[currency] : '';

  return `${value.toFixed(2)}${symbol ? ` ${symbol}` : ''}`;
};

const ContentSection = ({ products = [], currency }: ContentSectionProps) => {
  const grandTotal = products.reduce((total, product) => total + getRowTotal(product), 0);

  return (
    <>
      <CardHeader title="İçerik Özeti">
        <Inventory2Icon />
      </CardHeader>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ürün Adı</TableCell>
              <TableCell align="right">Adet</TableCell>
              <TableCell align="right">Birim Fiyat</TableCell>
              <TableCell align="right">GTIP</TableCell>
              <TableCell align="right">Toplam</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.length > 0 ? (
              products.map((product, index) => {
                const total = getRowTotal(product);

                return (
                  <TableRow key={`${product.gtip ?? product.name}-${index}`}>
                    <TableCell>{product.name || '-'}</TableCell>
                    <TableCell align="right">{product.piece ?? 0}</TableCell>
                    <TableCell align="right">{formatPrice(product.unitPrice ?? 0, currency)}</TableCell>
                    <TableCell align="right">{product.gtip || '-'}</TableCell>
                    <TableCell align="right">{formatPrice(total, currency)}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Ürün bulunamadı
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={4}>
                <Typography sx={{ fontWeight: 600 }}>Genel Toplam</Typography>
              </TableCell>

              <TableCell align="right">
                <Typography sx={{ fontWeight: 600 }}>{formatPrice(grandTotal, currency)}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ContentSection;
