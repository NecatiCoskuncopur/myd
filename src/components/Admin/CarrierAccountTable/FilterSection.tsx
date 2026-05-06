import React, { useState } from 'react';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';

import SearchIcon from '@mui/icons-material/Search';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { StyledButton } from '@/components';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();

  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    accountNumber: searchParams.get('accountNumber') || '',
    carrier: searchParams.get('carrier') || '',
    isActive: searchParams.get('isActive') || '',
  });

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
      else params.delete(key);
    });

    params.set('sayfa', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
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
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StyledButton variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
          Ara
        </StyledButton>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
