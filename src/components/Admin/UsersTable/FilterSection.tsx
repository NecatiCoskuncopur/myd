'use client';

import React, { useState } from 'react';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';

import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Grid, TextField, Box } from '@mui/material';

import { StyledButton } from '@/components';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();

  const initialFilters = {
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    email: '',
  };

  const [filters, setFilters] = useState({
    firstName: searchParams.get('firstName') || '',
    lastName: searchParams.get('lastName') || '',
    company: searchParams.get('company') || '',
    phone: searchParams.get('phone') || '',
    email: searchParams.get('email') || '',
  });

  const handleSearch = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim() !== '') params.set(key, value.trim());
    });

    params.set('sayfa', '1');
    params.set('limit', searchParams.get('limit') || '5');
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    router.push('?sayfa=1');
  };

  const isDirty = Object.values(filters).some(value => value !== '');

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
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TextField
          label="Ad"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.firstName}
          onChange={e => setFilters(prev => ({ ...prev, firstName: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TextField
          label="Soyad"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.lastName}
          onChange={e => setFilters(prev => ({ ...prev, lastName: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TextField
          label="Şirket"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.company}
          onChange={e => setFilters(prev => ({ ...prev, company: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TextField
          label="Telefon"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.phone}
          onChange={e => setFilters(prev => ({ ...prev, phone: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TextField
          label="Eposta"
          size="small"
          variant="outlined"
          fullWidth
          value={filters.email}
          onChange={e => setFilters(prev => ({ ...prev, email: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <StyledButton variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleSearch}>
            Ara
          </StyledButton>

          <StyledButton disabled={!isDirty} variant="outlined" fullWidth startIcon={<RestartAltIcon />} onClick={handleReset}>
            Sıfırla
          </StyledButton>
        </Box>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
