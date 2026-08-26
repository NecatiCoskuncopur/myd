'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { StyledButton } from '@/components';
import { Carrier, CarrierAccountTypeEnum } from '@/constants';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
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

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();

  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const handleSearch = () => {
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
  };

  const handleReset = () => {
    setFilters(initialFilters);

    const params = new URLSearchParams();

    params.set('sayfa', '1');
    params.set('limit', searchParams.get('limit') ?? '5');

    router.push(`?${params.toString()}`);
  };

  const isDirty = Object.values(filters).some(value => value !== '');

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
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
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
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
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
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
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
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
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
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
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
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
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <StyledButton type="button" variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleSearch}>
          Ara
        </StyledButton>
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <StyledButton type="button" disabled={!isDirty} variant="outlined" fullWidth startIcon={<RestartAltIcon />} onClick={handleReset}>
          Sıfırla
        </StyledButton>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
