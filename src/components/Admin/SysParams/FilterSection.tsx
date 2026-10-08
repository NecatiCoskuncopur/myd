'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Grid, IconButton, InputAdornment, TextField } from '@mui/material';

import { StyledButton } from '@/components';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const getFiltersFromSearchParams = (searchParams: ReadonlyURLSearchParams) => ({
  key: searchParams.get('key') ?? '',
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

  const handleClear = () => {
    setFilters(prev => ({
      ...prev,
      key: '',
    }));

    const params = new URLSearchParams(searchParams.toString());

    params.delete('key');
    params.set('sayfa', '1');

    router.push(`?${params.toString()}`);
  };

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
          label="Anahtar"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.key}
          onChange={event =>
            setFilters(prev => ({
              ...prev,
              key: event.target.value,
            }))
          }
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
          slotProps={{
            input: {
              endAdornment: filters.key ? (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Anahtarı temizle" onClick={handleClear} edge="end">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
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
    </Grid>
  );
};

export default FilterSection;
