'use client';

import React, { useState } from 'react';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';

import SearchIcon from '@mui/icons-material/Search';

import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { StyledButton } from '@/components';
import { CarrierAccountTypeEnum } from '@/constants';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();

  const initialFilters = {
    name: '',
    listType: '',
  };

  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    listType: searchParams.get('listType') || '',
  });

  const handleSearch = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params.set(key, value.toString());
    });

    params.set('sayfa', '1');
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    router.push('?sayfa=1');
  };

  const isDirty = Object.keys(initialFilters).some(key => filters[key as keyof typeof initialFilters] !== '');

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <TextField
          label="Hesap Adı"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.name}
          onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Liste Tipi</InputLabel>
          <Select value={filters.listType} label="Liste Tipi" onChange={e => setFilters(prev => ({ ...prev, listType: e.target.value }))}>
            <MenuItem value="">Tümü</MenuItem>
            {Object.values(CarrierAccountTypeEnum).map(carrier => (
              <MenuItem key={carrier} value={carrier}>
                {carrier}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 2 }}>
        <StyledButton variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleSearch}>
          Ara
        </StyledButton>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 2 }}>
        <StyledButton disabled={!isDirty} variant="outlined" fullWidth startIcon={<RestartAltIcon />} onClick={handleReset}>
          Sıfırla
        </StyledButton>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
