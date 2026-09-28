'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import type { FormEvent } from 'react';

import { FilterDrawer } from '@/components';
import { Carrier, CarrierAccountTypeEnum } from '@/constants';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
  open: boolean;
  onClose: () => void;
};

const initialFilters = {
  name: '',
  displayName: '',
  accountNumber: '',
  carrier: '',
  accountType: '',
  isActive: '',
};

const getFiltersFromSearchParams = (searchParams: ReadonlyURLSearchParams) => ({
  name: searchParams.get('name') ?? '',
  displayName: searchParams.get('displayName') ?? '',
  accountNumber: searchParams.get('accountNumber') ?? '',
  carrier: searchParams.get('carrier') ?? '',
  accountType: searchParams.get('accountType') ?? '',
  isActive: searchParams.get('isActive') ?? '',
});

const FilterSection = ({ searchParams, open, onClose }: FilterSectionProps) => {
  const router = useRouter();

  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const handleSearch = (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      const trimmedValue = value.trim();

      if (trimmedValue) {
        params.set(key, trimmedValue);
      }
    });

    params.set('sayfa', '1');
    params.set('limit', searchParams.get('limit') ?? '5');

    router.push(`?${params.toString()}`);
    onClose();
  };

  const handleReset = () => {
    setFilters(initialFilters);

    const params = new URLSearchParams();

    params.set('sayfa', '1');
    params.set('limit', searchParams.get('limit') ?? '5');

    router.push(`?${params.toString()}`);
    onClose();
  };

  const isDirty = Object.values(filters).some(value => value !== '');

  return (
    <FilterDrawer open={open} onClose={onClose} onSubmit={handleSearch} onReset={handleReset} isFiltered={isDirty}>
      <Stack spacing={2.5}>
        <TextField
          label="Hesap Adı"
          size="small"
          fullWidth
          value={filters.name}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              name: event.target.value,
            }))
          }
        />

        <TextField
          label="Görünen Hesap Adı"
          size="small"
          fullWidth
          value={filters.displayName}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              displayName: event.target.value,
            }))
          }
        />

        <TextField
          label="Hesap No"
          size="small"
          fullWidth
          value={filters.accountNumber}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              accountNumber: event.target.value,
            }))
          }
        />

        <FormControl fullWidth size="small">
          <InputLabel>Kargo Firması</InputLabel>
          <Select
            value={filters.carrier}
            label="Kargo Firması"
            onChange={event =>
              setFilters(prev => ({
                ...prev,
                carrier: event.target.value,
              }))
            }
          >
            <MenuItem value="">Tümü</MenuItem>
            {Object.values(Carrier).map(carrier => (
              <MenuItem key={carrier} value={carrier}>
                {carrier}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Hesap Tipi</InputLabel>
          <Select
            value={filters.accountType}
            label="Hesap Tipi"
            onChange={event =>
              setFilters(prev => ({
                ...prev,
                accountType: event.target.value,
              }))
            }
          >
            <MenuItem value="">Tümü</MenuItem>
            {Object.values(CarrierAccountTypeEnum).map(accountType => (
              <MenuItem key={accountType} value={accountType}>
                {accountType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Durum</InputLabel>
          <Select
            value={filters.isActive}
            label="Durum"
            onChange={event =>
              setFilters(prev => ({
                ...prev,
                isActive: event.target.value,
              }))
            }
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Pasif</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </FilterDrawer>
  );
};

export default FilterSection;
