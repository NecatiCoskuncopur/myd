'use client';

import React, { useState } from 'react';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';

import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField, Box } from '@mui/material';

import { StyledButton } from '@/components';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();

  const initialFilters = {
    name: '',
    accountNumber: '',
    carrier: '',
    isActive: '',
  };

  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    accountNumber: searchParams.get('accountNumber') || '',
    carrier: searchParams.get('carrier') || '',
    isActive: searchParams.get('isActive') || '',
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
    <Grid
      container
      spacing={2}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
        alignItems: 'center',
      }}
    >
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <TextField
          label="Hesap No"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.accountNumber}
          onChange={e => setFilters(prev => ({ ...prev, accountNumber: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Kargo Firması</InputLabel>
          <Select value={filters.carrier} label="Kargo Firması" onChange={e => setFilters(prev => ({ ...prev, carrier: e.target.value }))}>
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="FEDEX">FedEx</MenuItem>
            <MenuItem value="UPS">UPS</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Durum</InputLabel>
          <Select value={filters.isActive} label="Durum" onChange={e => setFilters(prev => ({ ...prev, isActive: e.target.value }))}>
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Pasif</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 2.4 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <StyledButton variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleSearch}>
            Ara
          </StyledButton>

          {isDirty && (
            <StyledButton variant="outlined" fullWidth startIcon={<RestartAltIcon />} onClick={handleReset}>
              Sıfırla
            </StyledButton>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
