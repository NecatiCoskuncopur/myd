'use client';

import { useMemo, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { TableHeader, TableWrapper, Wrapper } from '@/components';
import { CarrierAccountTypeEnum } from '@/constants';
import { PricingListTypes } from '@/types/pricingList';

import PriceCalculator from './PriceCalculator';

type PriceRow = {
  id: number;
  weight: number | string;
  [key: string]: number | string | null;
};

type PricingLists = Partial<Record<CarrierAccountTypeEnum, PricingListTypes.IPricingList>>;

type UserPriceListProps = {
  pricingLists: PricingLists;
};

const serviceTypeLabels: Record<CarrierAccountTypeEnum, string> = {
  [CarrierAccountTypeEnum.ECONOMY]: 'Economy',
  [CarrierAccountTypeEnum.EXPRESS]: 'Express',
};

const UserPriceList = ({ pricingLists }: UserPriceListProps) => {
  const availableTypes = useMemo(() => Object.values(CarrierAccountTypeEnum).filter(type => Boolean(pricingLists[type])), [pricingLists]);

  const [selectedType, setSelectedType] = useState<CarrierAccountTypeEnum>(() => availableTypes[0] ?? CarrierAccountTypeEnum.ECONOMY);

  const selectedPricingList = pricingLists[selectedType];

  const columns = useMemo<GridColDef<PriceRow>[]>(() => {
    if (!selectedPricingList) {
      return [];
    }

    return [
      {
        field: 'weight',
        headerName: 'Ağırlık',
        flex: 1,
      },
      ...selectedPricingList.zone.map(zone => ({
        field: `zone${zone.number}`,
        headerName: `${zone.number}. Bölge`,
        flex: 1,
      })),
    ];
  }, [selectedPricingList]);

  const rows = useMemo<PriceRow[]>(() => {
    if (!selectedPricingList) {
      return [];
    }

    const weights = Array.from(new Set(selectedPricingList.zone.flatMap(zone => zone.prices.map(price => price.weight ?? 0)))).sort((a, b) => a - b);

    const priceRows = weights.map((weight, index): PriceRow => {
      const row: PriceRow = {
        id: index + 1,
        weight,
      };

      selectedPricingList.zone.forEach(zone => {
        const price = zone.prices.find(item => item.weight === weight);

        row[`zone${zone.number}`] = price?.price ?? null;
      });

      return row;
    });

    const overflowRow: PriceRow = {
      id: weights.length + 1,
      weight: 'Paket Aşımı',
    };

    selectedPricingList.zone.forEach(zone => {
      overflowRow[`zone${zone.number}`] = zone.than ?? null;
    });

    return [...priceRows, overflowRow];
  }, [selectedPricingList]);

  return (
    <Wrapper>
      <TableHeader title="Fiyat Listem" subTitle="Anlaşmanıza ve bölgenize göre tanımlanan özel fiyatlandırma" stacked>
        {selectedPricingList && <PriceCalculator serviceType={selectedType} />}
      </TableHeader>

      {availableTypes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={selectedType}
            onChange={(_, value: CarrierAccountTypeEnum) => {
              setSelectedType(value);
            }}
          >
            {availableTypes.map(type => (
              <Tab key={type} value={type} label={serviceTypeLabels[type]} />
            ))}
          </Tabs>
        </Box>
      )}

      <TableWrapper>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter
          rowHeight={24}
          disableColumnMenu
          getRowClassName={params => (params.row.weight === 'Paket Aşımı' ? 'than-row' : '')}
          slotProps={{
            noRowsOverlay: {
              children: 'Hesabınıza tanımlı fiyat listesi bulunamadı.',
            },
          }}
          sx={theme => ({
            '& .MuiDataGrid-cell': {
              fontSize: 14,
              border: `1px solid ${theme.palette.dashboard.border}`,
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: 14,
            },
            '& .than-row': {
              fontWeight: 700,
              backgroundColor: theme.palette.action.hover,
            },
          })}
        />
      </TableWrapper>
    </Wrapper>
  );
};

export default UserPriceList;
