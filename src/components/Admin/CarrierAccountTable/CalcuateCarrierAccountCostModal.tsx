'use client';

import { FormEvent, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import calculateCarrierAccountCosts from '@/app/actions/admin/calculateCarrierAccountCosts';
import { StyledButton } from '@/components';
import { countries, generalMessages, shippingMessages } from '@/constants';
import { AdminTypes } from '@/types/admin';

type CountryOption = {
  code: string;
  turkishName: string;
  [key: string]: unknown;
};

type CalculateCarrierAccountCostModalProps = {
  open: boolean;
  onClose: () => void;
};

const CalculateCarrierAccountCostModal = ({ open, onClose }: CalculateCarrierAccountCostModalProps) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);

  const [weight, setWeight] = useState<number | ''>('');

  const [results, setResults] = useState<AdminTypes.ICalculateCarrierAccountCostResponse[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isWeightInvalid = weight !== '' && weight < 0.1;

  const canCalculate = Boolean(selectedCountry) && weight !== '' && !isWeightInvalid;

  const resetResult = () => {
    setResults([]);
    setErrorMessage(null);
  };

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCountry || weight === '' || !canCalculate) {
      return;
    }

    setIsLoading(true);
    resetResult();

    try {
      const response = await calculateCarrierAccountCosts({
        country: selectedCountry.code,
        weight,
      });

      if (response.status !== 'OK' || !response.data) {
        setErrorMessage(response.message ?? 'Maliyet bulunamadı.');

        return;
      }

      setResults(response.data);
    } catch {
      setErrorMessage(generalMessages.UNEXPECTED_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCountry(null);
    setWeight('');
    resetResult();

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: theme => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
          }),
        },
      }}
    >
      <Box component="form" onSubmit={handleCalculate}>
        <DialogTitle>Kargo Hesabı Maliyet Hesaplama</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Varış ülkesi ve Desi / KG bilgisine göre tanımlı kargo hesaplarının maliyetlerini karşılaştırabilirsiniz.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={countries as CountryOption[]}
                getOptionLabel={option => option.turkishName || ''}
                value={selectedCountry}
                onChange={(_, newValue) => {
                  setSelectedCountry(newValue);
                  resetResult();
                }}
                renderInput={params => <TextField {...params} label="Varış Ülkesi" placeholder="Ülke ara..." />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Desi / KG"
                type="number"
                value={weight}
                error={isWeightInvalid}
                helperText={isWeightInvalid ? shippingMessages.WEIGHT.MIN : ''}
                onChange={event => {
                  const value = event.target.value;

                  setWeight(value === '' ? '' : Number(value));
                  resetResult();
                }}
                slotProps={{
                  htmlInput: {
                    step: 0.1,
                    min: 0.1,
                  },
                }}
              />
            </Grid>
          </Grid>

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {results.length > 0 && (
            <TableContainer
              sx={{
                mt: 3,
                maxHeight: 400,
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Taşıyıcı</TableCell>
                    <TableCell>Hesap</TableCell>
                    <TableCell>Zone</TableCell>
                    <TableCell align="right">Maliyet</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {results.map(result => (
                    <TableRow key={result._id}>
                      <TableCell>{result.carrier}</TableCell>

                      <TableCell>{result.name}</TableCell>

                      <TableCell>{result.zone}</TableCell>

                      <TableCell align="right">
                        <strong>{result.price} $</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <StyledButton type="button" variant="outlined" onClick={handleClose} disabled={isLoading}>
            Kapat
          </StyledButton>

          <StyledButton type="submit" variant="contained" loading={isLoading} disabled={!canCalculate}>
            Hesapla
          </StyledButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CalculateCarrierAccountCostModal;
