'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { StyledButton } from '@/components';
import { CarrierAccountTypeEnum } from '@/constants';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const initialFilters = {
  name: '',
  listType: '',
};

const getFiltersFromSearchParams = (searchParams: ReadonlyURLSearchParams) => ({
  name: searchParams.get('name') ?? '',
  listType: searchParams.get('listType') ?? '',
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
      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 3,
        }}
      >
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
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 3,
        }}
      >
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
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 2,
        }}
      >
        <StyledButton type="button" variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleSearch}>
          Ara
        </StyledButton>
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 2,
        }}
      >
        <StyledButton type="button" disabled={!isDirty} variant="outlined" fullWidth startIcon={<RestartAltIcon />} onClick={handleReset}>
          Sıfırla
        </StyledButton>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
