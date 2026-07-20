'use client';

import React, { useState } from 'react';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Grid, TextField, IconButton, InputAdornment } from '@mui/material';

import { StyledButton } from '@/components';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();
  const [name, setName] = useState(searchParams.get('name') || '');

  const updateURL = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('name', value);
    } else {
      params.delete('name');
    }

    params.set('sayfa', '1');
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    updateURL(name.trim());
  };

  const handleClear = () => {
    setName('');
    updateURL(null);
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          label="Hesap Adı"
          size="small"
          variant="outlined"
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          slotProps={{
            input: {
              endAdornment: name && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear} edge="end">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <StyledButton variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleSearch}>
          Ara
        </StyledButton>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
