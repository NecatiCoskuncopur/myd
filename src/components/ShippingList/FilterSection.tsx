'use client';

import { useState, useEffect } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import listShipping from '@/app/actions/shipping/listShipping';
import StyledButton from '@/components/StyledButton';
import moment from 'moment';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';

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

      const response = await listShipping({
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
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2,
        alignItems: 'center',
      }}
    >
      <TextField
        label="Alıcı Adı"
        size="small"
        value={inputs.consigneeName}
        onChange={e => setInputs(prev => ({ ...prev, consigneeName: e.target.value }))}
        sx={{ width: { xs: '100%', lg: 'auto' } }}
      />
      <TextField
        label="Alıcı Telefon"
        size="small"
        value={inputs.consigneePhone}
        onChange={e => setInputs(prev => ({ ...prev, consigneePhone: e.target.value }))}
        sx={{ width: { xs: '100%', lg: 'auto' } }}
      />
      <TextField
        label="Takip No"
        size="small"
        value={inputs.trackingNumber}
        onChange={e => setInputs(prev => ({ ...prev, trackingNumber: e.target.value }))}
        sx={{ width: { xs: '100%', lg: 'auto' } }}
      />
      <DatePicker
        label="Başlangıç"
        slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', lg: 'auto' } } } }}
        value={inputs.startDate}
        onChange={val => setInputs(prev => ({ ...prev, startDate: val }))}
      />
      <DatePicker
        label="Bitiş"
        slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', lg: 'auto' } } } }}
        value={inputs.endDate}
        onChange={val => setInputs(prev => ({ ...prev, endDate: val }))}
      />

      <StyledButton type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ height: 40, width: { xs: '100%', lg: 'auto' } }}>
        Ara
      </StyledButton>

      <StyledButton
        disabled={!isFiltered}
        type="button"
        variant="outlined"
        startIcon={<RestartAltIcon />}
        onClick={handleReset}
        sx={{ height: 40, width: { xs: '100%', lg: 'auto' } }}
      >
        Sıfırla
      </StyledButton>

      <Button
        type="button"
        variant="outlined"
        color="success"
        startIcon={<FileDownloadIcon />}
        onClick={handleDownloadExcel}
        disabled={downloading}
        sx={{ height: 40, fontSize: 12, width: { xs: '100%', lg: 'auto' }, ml: { lg: 'auto' }, lineHeight: 1 }}
      >
        {downloading ? 'Hazırlanıyor...' : 'Dışa Aktar'}
      </Button>
    </Box>
  );
};

export default FilterSection;
