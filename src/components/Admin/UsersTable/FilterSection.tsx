'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Box, MenuItem, Stack, Tab, Tabs, TextField } from '@mui/material';
import type { FormEvent } from 'react';

import { FilterDrawer } from '@/components';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
  open: boolean;
  onClose: () => void;
};

const getFiltersFromSearchParams = (searchParams: ReadonlyURLSearchParams) => ({
  firstName: searchParams.get('firstName') ?? '',
  lastName: searchParams.get('lastName') ?? '',
  company: searchParams.get('company') ?? '',
  phone: searchParams.get('phone') ?? '',
  email: searchParams.get('email') ?? '',
  isActive: searchParams.get('isActive') ?? '',
  balanceSorting: searchParams.get('balanceSorting') ?? '',
});

const initialFilters = {
  firstName: '',
  lastName: '',
  company: '',
  phone: '',
  email: '',
  isActive: '',
  balanceSorting: '',
};

const FilterSection = ({ searchParams, open, onClose }: FilterSectionProps) => {
  const router = useRouter();

  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newValue === '') {
      params.delete('isActive');
    } else {
      params.set('isActive', newValue);
    }

    params.set('sayfa', '1');
    router.push(`?${params.toString()}`);
    onClose();
  };

  const handleSearch = (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    const params = new URLSearchParams(searchParams.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'isActive') return;

      const trimmedValue = value.trim();

      if (trimmedValue) {
        params.set(key, trimmedValue);
      } else {
        params.delete(key);
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

  const isDirty = Object.entries(filters).some(([key, value]) => key !== 'isActive' && value !== '');

  return (
    <FilterDrawer open={open} onClose={onClose} onSubmit={handleSearch} onReset={handleReset} isFiltered={isDirty}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={filters.isActive} onChange={handleTabChange} aria-label="user status tabs" variant="scrollable" scrollButtons="auto">
          <Tab label="Tümü" value="" />
          <Tab label="Aktif" value="true" />
          <Tab label="Pasif" value="false" />
        </Tabs>
      </Box>

      <Stack spacing={2.5}>
        <TextField
          label="Ad"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.firstName}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              firstName: event.target.value,
            }))
          }
        />

        <TextField
          label="Soyad"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.lastName}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              lastName: event.target.value,
            }))
          }
        />

        <TextField
          label="Şirket"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.company}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              company: event.target.value,
            }))
          }
        />

        <TextField
          label="Telefon"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.phone}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              phone: event.target.value,
            }))
          }
        />

        <TextField
          label="Eposta"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.email}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              email: event.target.value,
            }))
          }
        />

        <TextField
          select
          label="Bakiye Sıralaması"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.balanceSorting}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              balanceSorting: event.target.value,
            }))
          }
        >
          <MenuItem value="">Sıralama Yok</MenuItem>
          <MenuItem value="1">Artan</MenuItem>
          <MenuItem value="-1">Azalan</MenuItem>
        </TextField>
      </Stack>
    </FilterDrawer>
  );
};

export default FilterSection;
