'use client';

import React, { useState } from 'react';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { StyledButton } from '@/components';
import { Carrier, CarrierAccountTypeEnum } from '@/constants';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();

  const initialFilters = {
    name: '',
    displayName: '',
    accountNumber: '',
    carrier: '',
    accountType: '',
    isActive: '',
  };

  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    displayName: searchParams.get('displayName') || '',
    accountNumber: searchParams.get('accountNumber') || '',
    carrier: searchParams.get('carrier') || '',
    accountType: searchParams.get('accountType') || '',
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
        mb: 3,
      }}
    >
      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
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

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <TextField
          label="Görünen Hesap Adı"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.displayName}
          onChange={e => setFilters(prev => ({ ...prev, displayName: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
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

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Kargo Firması</InputLabel>
          <Select value={filters.carrier} label="Kargo Firması" onChange={e => setFilters(prev => ({ ...prev, carrier: e.target.value }))}>
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
          <Select value={filters.accountType} label="Hesap Tipi" onChange={e => setFilters(prev => ({ ...prev, accountType: e.target.value }))}>
            <MenuItem value="">Tümü</MenuItem>
            {Object.values(CarrierAccountTypeEnum).map(carrier => (
              <MenuItem key={carrier} value={carrier}>
                {carrier}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Durum</InputLabel>
          <Select value={filters.isActive} label="Durum" onChange={e => setFilters(prev => ({ ...prev, isActive: e.target.value }))}>
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Pasif</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <StyledButton variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleSearch}>
          Ara
        </StyledButton>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <StyledButton disabled={!isDirty} variant="outlined" fullWidth startIcon={<RestartAltIcon />} onClick={handleReset}>
          Sıfırla
        </StyledButton>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
