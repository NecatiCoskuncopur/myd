'use client';

import { useEffect, useMemo, useState } from 'react';

import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import getUserPricingList from '@/app/actions/user/getUserPricingList';
import { TableHeader, TableWrapper, Wrapper } from '@/components';
import { CarrierAccountTypeEnum, generalMessages } from '@/constants';
import { PricingListTypes } from '@/types/pricingList';
import PriceCalculator from './PriceCalculator';

type Row = {
  id: number;
  weight: number | string;
  [key: string]: number | string | null;
};

type PricingLists = Partial<Record<CarrierAccountTypeEnum, PricingListTypes.IPricingList>>;

const serviceTypeLabels: Record<CarrierAccountTypeEnum, string> = {
  [CarrierAccountTypeEnum.ECONOMY]: 'Economy',
  [CarrierAccountTypeEnum.EXPRESS]: 'Express',
};

const UserPriceList = () => {
  const theme = useTheme();

  const [data, setData] = useState<PricingLists>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<CarrierAccountTypeEnum>(CarrierAccountTypeEnum.ECONOMY);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchUserPriceList = async () => {
      setLoading(true);

      try {
        const result = await getUserPricingList();

        if (result.status === 'OK' && result.data) {
          setData(result.data);

          const availableTypes = Object.values(CarrierAccountTypeEnum).filter(type => result.data?.[type]);

          if (availableTypes.length > 0) {
            setSelectedType(current => (result.data?.[current] ? current : availableTypes[0]));
          }
        } else {
          console.error(result.message || generalMessages.UNEXPECTED_ERROR);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPriceList();
  }, [isMounted]);

  const availableTypes = useMemo(() => Object.values(CarrierAccountTypeEnum).filter(type => data[type]), [data]);

  const selectedPricingList = data[selectedType];

  const columns: GridColDef[] = useMemo(() => {
    if (!selectedPricingList) return [];

    return [
      {
        field: 'weight',
        headerName: 'Ağırlık',
        flex: 1,
      },
      ...selectedPricingList.zone.map(z => ({
        field: `zone${z.number}`,
        headerName: `${z.number}. Bölge`,
        flex: 1,
      })),
    ];
  }, [selectedPricingList]);

  const rows: Row[] = useMemo(() => {
    if (!selectedPricingList) return [];

    const weightSet = new Set<number>();

    selectedPricingList.zone.forEach(z => {
      z.prices.forEach(p => {
        weightSet.add(p.weight ?? 0);
      });
    });

    const weights = Array.from(weightSet).sort((a, b) => a - b);

    const baseRows: Row[] = weights.map((weight, i) => {
      const row: Row = {
        id: i + 1,
        weight,
      };

      selectedPricingList.zone.forEach(z => {
        const found = z.prices.find(p => p.weight === weight);

        row[`zone${z.number}`] = found?.price ?? null;
      });

      return row;
    });

    const thanRow: Row = {
      id: weights.length + 1,
      weight: 'Paket Aşımı',
    };

    selectedPricingList.zone.forEach(z => {
      thanRow[`zone${z.number}`] = z.than ?? null;
    });

    return [...baseRows, thanRow];
  }, [selectedPricingList]);

  if (!isMounted) return null;

  return (
    <Wrapper>
      <TableHeader title="Fiyat Listem" subTitle="Anlaşmanıza ve bölgenize göre tanımlanan özel fiyatlandırma" stacked={true}>
        <PriceCalculator serviceType={selectedType} />
      </TableHeader>

      {availableTypes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Tabs value={selectedType} onChange={(_, value: CarrierAccountTypeEnum) => setSelectedType(value)}>
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
          loading={loading}
          hideFooter
          editMode="cell"
          rowHeight={24}
          disableColumnMenu
          getRowClassName={params => (params.row.weight === 'Paket Aşımı' ? 'than-row' : '')}
          slotProps={{
            noRowsOverlay: {
              children: 'Hesabınıza tanımlı fiyat listesi bulunamadı.',
            },
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: 14,
              border: `1px solid ${theme.palette.dashboard.border}`,
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: 14,
            },
            '& .than-row': {
              fontWeight: 'bold',
              backgroundColor: theme.palette.action.hover,
            },
          }}
        />
      </TableWrapper>
    </Wrapper>
  );
};

export default UserPriceList;
