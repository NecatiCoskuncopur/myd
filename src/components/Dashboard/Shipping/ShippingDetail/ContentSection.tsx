import React, { useMemo } from 'react';

import Inventory2Icon from '@mui/icons-material/Inventory2';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import CardHeader from './CardHeader';

type Product = {
  name?: string;
  unitPrice?: number;
  piece?: number;
  gtip?: string;
};

type ContentSectionProps = {
  products: Product[] | undefined;
  currency: 'USD' | 'EUR' | 'GBP' | undefined;
};

const ContentSection = ({ products = [], currency }: ContentSectionProps) => {
  const getRowTotal = (product: Product) => {
    const price = product.unitPrice || 0;
    const piece = product.piece || 0;
    return price * piece;
  };

  const grandTotal = useMemo(() => {
    return products.reduce((acc, product) => acc + getRowTotal(product), 0);
  }, [products]);

  const formatPrice = (value: number) => {
    return `${value.toFixed(2)} ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}`;
  };

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
                  <TableRow key={index}>
                    <TableCell>{product.name || '-'}</TableCell>
                    <TableCell align="right">{product.piece || 0}</TableCell>
                    <TableCell align="right">{formatPrice(product.unitPrice || 0)}</TableCell>
                    <TableCell align="right">{product.gtip || '-'}</TableCell>
                    <TableCell align="right">{formatPrice(total)}</TableCell>
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
                <Typography fontWeight={600}>Genel Toplam</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={600}>{formatPrice(grandTotal)}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ContentSection;
