'use client';

import { useEffect, useState } from 'react';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Divider, Stack, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { Moment } from 'moment';
import type { FormEvent } from 'react';

import listShipping from '@/app/actions/shipping/listShipping';
import { FilterDrawer, StyledButton } from '@/components';
import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
  open: boolean;
  onClose: () => void;
};

type FilterInputs = {
  consigneeName: string;
  consigneePhone: string;
  startDate: Moment | null;
  endDate: Moment | null;
};

const getFilterInputs = (searchParams: ReadonlyURLSearchParams): FilterInputs => ({
  consigneeName: searchParams.get('consigneeName') ?? '',
  consigneePhone: searchParams.get('consigneePhone') ?? '',
  startDate: searchParams.get('startDate') ? moment(searchParams.get('startDate')) : null,
  endDate: searchParams.get('endDate') ? moment(searchParams.get('endDate')) : null,
});

const downloadBase64File = (content: string, fileName: string) => {
  const byteCharacters = atob(content);
  const byteNumbers = Array.from(byteCharacters, character => character.charCodeAt(0));

  const blob = new Blob([new Uint8Array(byteNumbers)], {
    type: 'application/vnd.ms-excel',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const FilterSection = ({ searchParams, open, onClose }: FilterSectionProps) => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [inputs, setInputs] = useState<FilterInputs>(() => getFilterInputs(searchParams));
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setInputs(getFilterInputs(searchParams));
  }, [searchParams]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    params.set('sayfa', '1');

    const setOrDelete = (key: string, value?: string) => {
      if (value) {
        params.set(key, value);
        return;
      }

      params.delete(key);
    };

    setOrDelete('consigneeName', inputs.consigneeName);
    setOrDelete('consigneePhone', inputs.consigneePhone);
    setOrDelete('startDate', inputs.startDate?.toISOString());
    setOrDelete('endDate', inputs.endDate?.toISOString());

    router.push(`?${params.toString()}`);
    onClose();
  };

  const handleReset = () => {
    setInputs({
      consigneeName: '',
      consigneePhone: '',
      startDate: null,
      endDate: null,
    });

    router.push('?sayfa=1');
    onClose();
  };

  const handleDownloadExcel = async () => {
    setIsDownloading(true);

    try {
      const response = await listShipping({
        download: true,
        consigneeName: inputs.consigneeName || undefined,
        consigneePhone: inputs.consigneePhone || undefined,
        startDate: inputs.startDate?.toISOString(),
        endDate: inputs.endDate?.toISOString(),
      });

      if (response.status !== 'OK' || !response.data || !('content' in response.data)) {
        showSnackbar(response.message ?? generalMessages.UNEXPECTED_ERROR, 'error');
        return;
      }

      downloadBase64File(response.data.content, response.data.fileName);
    } catch {
      showSnackbar(generalMessages.UNEXPECTED_ERROR, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const isFiltered = Boolean(inputs.consigneeName || inputs.consigneePhone || inputs.startDate || inputs.endDate);

  return (
    <FilterDrawer open={open} onClose={onClose} onSubmit={handleSearch} onReset={handleReset} isFiltered={isFiltered}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Stack spacing={2.5}>
          <TextField
            label="Alıcı Adı"
            size="small"
            fullWidth
            value={inputs.consigneeName}
            onChange={event => setInputs(current => ({ ...current, consigneeName: event.target.value }))}
          />

          <TextField
            label="Alıcı Telefon"
            size="small"
            fullWidth
            value={inputs.consigneePhone}
            onChange={event => setInputs(current => ({ ...current, consigneePhone: event.target.value }))}
          />
          <DatePicker
            label="Başlangıç"
            value={inputs.startDate}
            onChange={startDate => setInputs(current => ({ ...current, startDate }))}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />

          <DatePicker
            label="Bitiş"
            value={inputs.endDate}
            onChange={endDate => setInputs(current => ({ ...current, endDate }))}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <StyledButton
          type="button"
          fullWidth
          variant="outlined"
          color="success"
          startIcon={<FileDownloadIcon />}
          loading={isDownloading}
          disabled={isDownloading}
          onClick={handleDownloadExcel}
          sx={{ fontSize: 13 }}
        >
          Excele Aktar
        </StyledButton>
      </LocalizationProvider>
    </FilterDrawer>
  );
};

export default FilterSection;
