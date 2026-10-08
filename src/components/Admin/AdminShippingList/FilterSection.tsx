'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import type { Moment } from 'moment';
import moment from 'moment';

import listAllShipping from '@/app/actions/admin/listAllShipping';
import StyledButton from '@/components/StyledButton';
import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

type FilterInputs = {
  consigneeName: string;
  consigneePhone: string;
  trackingNumber: string;
  startDate: Moment | null;
  endDate: Moment | null;
};

const { UNEXPECTED_ERROR } = generalMessages;

const getInputsFromSearchParams = (searchParams: ReadonlyURLSearchParams): FilterInputs => ({
  consigneeName: searchParams.get('consigneeName') ?? '',
  consigneePhone: searchParams.get('consigneePhone') ?? '',
  trackingNumber: searchParams.get('trackingNumber') ?? '',
  startDate: searchParams.get('startDate') ? moment(searchParams.get('startDate')) : null,
  endDate: searchParams.get('endDate') ? moment(searchParams.get('endDate')) : null,
});

const initialInputs: FilterInputs = {
  consigneeName: '',
  consigneePhone: '',
  trackingNumber: '',
  startDate: null,
  endDate: null,
};

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [isDownloading, setIsDownloading] = useState(false);

  const [inputs, setInputs] = useState<FilterInputs>(() => getInputsFromSearchParams(searchParams));

  useEffect(() => {
    setInputs(getInputsFromSearchParams(searchParams));
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    const consigneeName = inputs.consigneeName.trim();

    const consigneePhone = inputs.consigneePhone.trim();

    const trackingNumber = inputs.trackingNumber.trim();

    if (consigneeName) {
      params.set('consigneeName', consigneeName);
    }

    if (consigneePhone) {
      params.set('consigneePhone', consigneePhone);
    }

    if (trackingNumber) {
      params.set('trackingNumber', trackingNumber);
    }

    if (inputs.startDate) {
      params.set('startDate', inputs.startDate.toISOString());
    }

    if (inputs.endDate) {
      params.set('endDate', inputs.endDate.toISOString());
    }

    params.set('sayfa', '1');

    params.set('limit', searchParams.get('limit') ?? '5');

    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setInputs(initialInputs);

    const params = new URLSearchParams();

    params.set('sayfa', '1');

    params.set('limit', searchParams.get('limit') ?? '5');

    router.push(`?${params.toString()}`);
  };

  const handleDownloadExcel = async () => {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      const response = await listAllShipping({
        download: true,

        consigneeName: inputs.consigneeName.trim() || undefined,

        consigneePhone: inputs.consigneePhone.trim() || undefined,

        trackingNumber: inputs.trackingNumber.trim() || undefined,

        startDate: inputs.startDate?.toISOString(),

        endDate: inputs.endDate?.toISOString(),
      });

      if (response.status !== 'OK' || !response.data || !('content' in response.data)) {
        showSnackbar(response.message ?? 'Excel dosyası oluşturulamadı.', 'error');

        return;
      }

      const { content, fileName } = response.data;

      const byteCharacters = atob(content);

      const byteArray = Uint8Array.from(byteCharacters, character => character.charCodeAt(0));

      const blob = new Blob([byteArray], {
        type: 'application/vnd.ms-excel',
      });

      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = fileName;
      anchor.style.display = 'none';

      document.body.appendChild(anchor);

      anchor.click();

      document.body.removeChild(anchor);

      window.URL.revokeObjectURL(url);
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const isFiltered =
    inputs.consigneeName !== '' || inputs.consigneePhone !== '' || inputs.trackingNumber !== '' || inputs.startDate !== null || inputs.endDate !== null;

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 1.5,
        }}
      >
        <TextField
          label="Alıcı Adı"
          size="small"
          fullWidth
          value={inputs.consigneeName}
          onChange={event =>
            setInputs(prev => ({
              ...prev,
              consigneeName: event.target.value,
            }))
          }
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 1.5,
        }}
      >
        <TextField
          label="Alıcı Telefon"
          size="small"
          fullWidth
          value={inputs.consigneePhone}
          onChange={event =>
            setInputs(prev => ({
              ...prev,
              consigneePhone: event.target.value,
            }))
          }
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 1.5,
        }}
      >
        <TextField
          label="Takip No"
          size="small"
          fullWidth
          value={inputs.trackingNumber}
          onChange={event =>
            setInputs(prev => ({
              ...prev,
              trackingNumber: event.target.value,
            }))
          }
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 1.5,
        }}
      >
        <DatePicker
          label="Başlangıç"
          value={inputs.startDate}
          onChange={value =>
            setInputs(prev => ({
              ...prev,
              startDate: value,
            }))
          }
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
            },
          }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 6,
          lg: 1.5,
        }}
      >
        <DatePicker
          label="Bitiş"
          value={inputs.endDate}
          onChange={value =>
            setInputs(prev => ({
              ...prev,
              endDate: value,
            }))
          }
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
            },
          }}
        />
      </Grid>

      <Grid
        size={{
          xs: 6,
          md: 2,
          lg: 1.5,
        }}
      >
        <StyledButton type="button" fullWidth variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
          Ara
        </StyledButton>
      </Grid>

      <Grid
        size={{
          xs: 6,
          md: 2,
          lg: 1.5,
        }}
      >
        <StyledButton type="button" disabled={!isFiltered} fullWidth variant="outlined" startIcon={<RestartAltIcon />} onClick={handleReset}>
          Sıfırla
        </StyledButton>
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 2,
          lg: 1.5,
        }}
      >
        <Button
          type="button"
          variant="outlined"
          color="success"
          fullWidth
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          sx={{
            fontSize: 12,
            lineHeight: 1,
          }}
        >
          {isDownloading ? 'Hazırlanıyor...' : 'Dışa Aktar'}
        </Button>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
