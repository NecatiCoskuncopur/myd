'use client';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Button, Grid, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { shippingMessages } from '@/constants';
import ErrorTooltip from './ErrorToolTip';
import Wrapper from './Wrapper';

const { CURRENCY, DESCRIPTION, FREIGHT, PRODUCT } = shippingMessages;

const PackageContentSection = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ShippingTypes.ICreateShippingPayload | ShippingTypes.IUpdateShippingPayload>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'content.products',
  });

  return (
    <Wrapper title="Gönderi İçeriği">
      <Grid size={{ xs: 12, md: 3 }}>
        <Controller
          name="content.currency"
          control={control}
          rules={{
            required: CURRENCY.REQUIRED,
            validate: value => {
              if (value === 'USD' || value === 'EUR' || value === 'GBP') {
                return true;
              }
              return CURRENCY.INVALID;
            },
          }}
          render={({ field }) => {
            const errorMessage = errors.content?.currency?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} select label="Para Birimi *" fullWidth error={!!errorMessage}>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </TextField>
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Controller
          name="content.freight"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value < 1) return FREIGHT.MIN;
              return true;
            },
          }}
          control={control}
          render={({ field }) => {
            const errorMessage = errors.content?.freight?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Navlun Bedeli" fullWidth error={!!errorMessage} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="content.description"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length > 50) return DESCRIPTION.MAX;
              return true;
            },
          }}
          control={control}
          render={({ field }) => {
            const errorMessage = errors.content?.description?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Açıklama" fullWidth error={!!errorMessage} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      {fields.map((fieldItem, index) => (
        <Grid container spacing={2} key={fieldItem.id} sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name={`content.products.${index}.name`}
              rules={{
                required: PRODUCT.NAME.REQUIRED,
                minLength: { value: 2, message: PRODUCT.NAME.MIN },
                maxLength: { value: 25, message: PRODUCT.NAME.MAX },
              }}
              control={control}
              render={({ field }) => {
                const errorMessage = errors.content?.products?.[index]?.name?.message;

                return (
                  <ErrorTooltip message={errorMessage}>
                    <TextField {...field} label="Ürün Adı *" fullWidth error={!!errorMessage} />
                  </ErrorTooltip>
                );
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Controller
              name={`content.products.${index}.piece`}
              rules={{
                required: PRODUCT.PIECE.REQUIRED,
                min: { value: 1, message: PRODUCT.PIECE.MIN },
              }}
              control={control}
              render={({ field }) => {
                const errorMessage = errors.content?.products?.[index]?.piece?.message;

                return (
                  <ErrorTooltip message={errorMessage}>
                    <TextField {...field} label="Adet *" type="number" fullWidth error={!!errorMessage} />
                  </ErrorTooltip>
                );
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Controller
              name={`content.products.${index}.unitPrice`}
              control={control}
              rules={{
                required: PRODUCT.UNITPRICE.REQUIRED,
              }}
              render={({ field }) => {
                const errorMessage = errors.content?.products?.[index]?.unitPrice?.message;

                return (
                  <ErrorTooltip message={errorMessage}>
                    <TextField {...field} label="Birim Fiyat *" type="number" fullWidth error={!!errorMessage} />
                  </ErrorTooltip>
                );
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name={`content.products.${index}.harmonizedCode`}
              control={control}
              render={({ field }) => {
                const errorMessage = errors.content?.products?.[index]?.harmonizedCode?.message;

                return (
                  <ErrorTooltip message={errorMessage}>
                    <TextField
                      {...field}
                      label="GTIP"
                      fullWidth
                      error={!!errorMessage}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="GTİP kodunu bulmak için tıkla">
                              <IconButton component="a" href="https://uygulama.gtb.gov.tr/Tara" target="_blank" rel="noopener noreferrer">
                                <HelpOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </ErrorTooltip>
                );
              }}
            />
          </Grid>

          {fields.length > 1 && (
            <Grid size={{ xs: 12, md: 2 }}>
              <Button color="error" onClick={() => remove(index)} fullWidth>
                <RemoveCircleOutlineIcon />
              </Button>
            </Grid>
          )}
        </Grid>
      ))}

      <Button
        variant="outlined"
        fullWidth
        onClick={() =>
          append({
            name: '',
            piece: 1,
            unitPrice: 0,
            harmonizedCode: '',
          })
        }
      >
        + Farklı Ürün Ekle
      </Button>
    </Wrapper>
  );
};

export default PackageContentSection;
