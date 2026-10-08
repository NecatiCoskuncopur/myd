'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Grid, MenuItem, Tab, Tabs, TextField } from '@mui/material';

import { StyledButton } from '@/components';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
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

const FilterSection = ({ searchParams }: FilterSectionProps) => {
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

    params.set('sayfa', '1'); // Filtre/Tab değiştiğinde 1. sayfaya dön
    router.push(`?${params.toString()}`);
  };

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
    <Box sx={{ mb: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filters.isActive} onChange={handleTabChange} aria-label="user status tabs">
          <Tab label="Tümü" value="" />
          <Tab label="Aktif Kullanıcılar" value="true" />
          <Tab label="Pasif Kullanıcılar" value="false" />
        </Tabs>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6, lg: 1.7 }}>
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
            onKeyDown={event => {
              if (event.key === 'Enter') handleSearch();
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 1.7 }}>
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
            onKeyDown={event => {
              if (event.key === 'Enter') handleSearch();
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 1.7 }}>
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
            onKeyDown={event => {
              if (event.key === 'Enter') handleSearch();
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 1.7 }}>
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
            onKeyDown={event => {
              if (event.key === 'Enter') handleSearch();
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 1.7 }}>
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
            onKeyDown={event => {
              if (event.key === 'Enter') handleSearch();
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 1.7 }}>
          <TextField
            select
            label="Bakiye"
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
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 1.8 }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <StyledButton type="button" variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleSearch} sx={{ minWidth: 0, px: 1 }}>
                Ara
              </StyledButton>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <StyledButton
                type="button"
                disabled={!isDirty}
                variant="outlined"
                fullWidth
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                sx={{ minWidth: 0, px: 1 }}
              >
                Sıfırla
              </StyledButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterSection;
