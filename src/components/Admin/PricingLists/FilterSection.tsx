'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import type { FormEvent } from 'react';

import { FilterDrawer } from '@/components';
import { CarrierAccountTypeEnum } from '@/constants';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
  open: boolean;
  onClose: () => void;
};

const initialFilters = {
  name: '',
  listType: '',
};

const getFiltersFromSearchParams = (searchParams: ReadonlyURLSearchParams) => ({
  name: searchParams.get('name') ?? '',
  listType: searchParams.get('listType') ?? '',
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
          variant="outlined"
          fullWidth
          value={filters.name}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              name: event.target.value,
            }))
          }
        />

        <FormControl fullWidth size="small">
          <InputLabel>Liste Tipi</InputLabel>
          <Select
            value={filters.listType}
            label="Liste Tipi"
            onChange={event =>
              setFilters(prev => ({
                ...prev,
                listType: event.target.value,
              }))
            }
          >
            <MenuItem value="">Tümü</MenuItem>
            {Object.values(CarrierAccountTypeEnum).map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </FilterDrawer>
  );
};

export default FilterSection;
