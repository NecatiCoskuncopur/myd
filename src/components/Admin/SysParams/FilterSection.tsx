'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Stack, TextField } from '@mui/material';
import type { FormEvent } from 'react';

import { FilterDrawer } from '@/components';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
  open: boolean;
  onClose: () => void;
};

const getFiltersFromSearchParams = (searchParams: ReadonlyURLSearchParams) => ({
  key: searchParams.get('key') ?? '',
});

const FilterSection = ({ searchParams, open, onClose }: FilterSectionProps) => {
  const router = useRouter();

  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const handleSearch = (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    const params = new URLSearchParams();
    const trimmedKey = filters.key.trim();

    if (trimmedKey) {
      params.set('key', trimmedKey);
    }

    params.set('sayfa', '1');
    params.set('limit', searchParams.get('limit') ?? '5');

    router.push(`?${params.toString()}`);
    onClose();
  };

  const handleReset = () => {
    setFilters({ key: '' });

    const params = new URLSearchParams(searchParams.toString());

    params.delete('key');
    params.set('sayfa', '1');

    router.push(`?${params.toString()}`);
    onClose();
  };

  const isDirty = filters.key !== '';

  return (
    <FilterDrawer open={open} onClose={onClose} onSubmit={handleSearch} onReset={handleReset} isFiltered={isDirty}>
      <Stack spacing={2.5}>
        <TextField label="Anahtar" size="small" variant="outlined" fullWidth value={filters.key} onChange={event => setFilters({ key: event.target.value })} />
      </Stack>
    </FilterDrawer>
  );
};

export default FilterSection;
