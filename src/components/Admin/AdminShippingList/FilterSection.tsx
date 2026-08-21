'use client';

import { useEffect, useState } from 'react';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import listAllShipping from '@/app/actions/admin/listAllShipping';
import StyledButton from '@/components/StyledButton';

type FilterSectionProps = {
  searchParams: ReadonlyURLSearchParams;
};

const FilterSection = ({ searchParams }: FilterSectionProps) => {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const [inputs, setInputs] = useState({
    consigneeName: searchParams.get('consigneeName') || '',
    consigneePhone: searchParams.get('consigneePhone') || '',
    trackingNumber: searchParams.get('trackingNumber') || '',
    startDate: searchParams.get('startDate') ? moment(searchParams.get('startDate')) : null,
    endDate: searchParams.get('endDate') ? moment(searchParams.get('endDate')) : null,
  });

  useEffect(() => {
    setInputs({
      consigneeName: searchParams.get('consigneeName') || '',
      consigneePhone: searchParams.get('consigneePhone') || '',
      trackingNumber: searchParams.get('trackingNumber') || '',
      startDate: searchParams.get('startDate') ? moment(searchParams.get('startDate')) : null,
      endDate: searchParams.get('endDate') ? moment(searchParams.get('endDate')) : null,
    });
  }, [searchParams]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    params.set('sayfa', '1');

    if (inputs.consigneeName) params.set('consigneeName', inputs.consigneeName);
    else params.delete('consigneeName');
    if (inputs.consigneePhone) params.set('consigneePhone', inputs.consigneePhone);
    else params.delete('consigneePhone');
    if (inputs.trackingNumber) params.set('trackingNumber', inputs.trackingNumber);
    else params.delete('trackingNumber');
    if (inputs.startDate) params.set('startDate', inputs.startDate.toISOString());
    else params.delete('startDate');
    if (inputs.endDate) params.set('endDate', inputs.endDate.toISOString());
    else params.delete('endDate');

    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setInputs({
      consigneeName: '',
      consigneePhone: '',
      trackingNumber: '',
      startDate: null,
      endDate: null,
    });
    router.push('?sayfa=1');
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);

      const response = await listAllShipping({
        download: true,
        consigneeName: inputs.consigneeName || undefined,
        consigneePhone: inputs.consigneePhone || undefined,
        trackingNumber: inputs.trackingNumber || undefined,
        startDate: inputs.startDate?.toISOString(),
        endDate: inputs.endDate?.toISOString(),
      });

      if (response.status === 'OK' && response.data && 'content' in response.data) {
        const { content, fileName } = response.data;

        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], {
          type: 'application/vnd.ms-excel',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Excel indirilirken bir hata oluştu:', error);
    } finally {
      setDownloading(false);
    }
  };

  const isFiltered = inputs.consigneeName || inputs.consigneePhone || inputs.trackingNumber || inputs.startDate || inputs.endDate;

  return (
    <Grid component="form" onSubmit={handleSearch} container spacing={2}>
      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <TextField
          label="Alıcı Adı"
          size="small"
          fullWidth
          value={inputs.consigneeName}
          onChange={e => setInputs(prev => ({ ...prev, consigneeName: e.target.value }))}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <TextField
          label="Alıcı Telefon"
          size="small"
          fullWidth
          value={inputs.consigneePhone}
          onChange={e => setInputs(prev => ({ ...prev, consigneePhone: e.target.value }))}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <TextField
          label="Takip No"
          size="small"
          fullWidth
          value={inputs.trackingNumber}
          onChange={e => setInputs(prev => ({ ...prev, trackingNumber: e.target.value }))}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <DatePicker
          label="Başlangıç"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          value={inputs.startDate}
          onChange={val => setInputs(prev => ({ ...prev, startDate: val }))}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 1.5 }}>
        <DatePicker
          label="Bitiş"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          value={inputs.endDate}
          onChange={val => setInputs(prev => ({ ...prev, endDate: val }))}
        />
      </Grid>

      <Grid size={{ xs: 6, md: 2, lg: 1.5 }}>
        <StyledButton type="submit" fullWidth variant="contained" startIcon={<SearchIcon />}>
          Ara
        </StyledButton>
      </Grid>

      <Grid size={{ xs: 6, md: 2, lg: 1.5 }}>
        <StyledButton disabled={!isFiltered} fullWidth type="button" variant="outlined" startIcon={<RestartAltIcon />} onClick={handleReset}>
          Sıfırla
        </StyledButton>
      </Grid>

      <Grid size={{ xs: 12, md: 2, lg: 1.5 }}>
        <Button
          type="button"
          variant="outlined"
          color="success"
          fullWidth
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadExcel}
          disabled={downloading}
          sx={{ fontSize: 12, lineHeight: 1 }}
        >
          {downloading ? 'Hazırlanıyor...' : 'Dışa Aktar'}
        </Button>
      </Grid>
    </Grid>
  );
};

export default FilterSection;
