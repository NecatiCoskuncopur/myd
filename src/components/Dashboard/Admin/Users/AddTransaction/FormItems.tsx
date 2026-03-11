import React from 'react';

import { MenuItem, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { messages } from '@/constants';

const { TRANSACTION } = messages;

type FormItemsProps = {
  errors: FieldErrors<IAddTransactionUserBalancePayload>;
  control: Control<IAddTransactionUserBalancePayload, IAddTransactionUserBalancePayload>;
};

const FormItems = ({ errors, control }: FormItemsProps) => {
  return (
    <>
      <Controller
        name="type"
        control={control}
        rules={{
          required: TRANSACTION.TYPE_REQUIRED,
        }}
        render={({ field }) => (
          <TextField {...field} select label="İşlem Tipi" fullWidth error={!!errors.type} helperText={errors.type?.message}>
            <MenuItem value="PAY">Ödeme</MenuItem>
            <MenuItem value="SPEND">Harcama</MenuItem>
          </TextField>
        )}
      />
      <Controller
        name="amount"
        control={control}
        rules={{
          required: TRANSACTION.AMOUNT_REQUIRED,
          min: { value: 0.1, message: TRANSACTION.AMOUNT_MIN },
        }}
        render={({ field }) => <TextField {...field} label="Miktar" type="number" fullWidth error={!!errors.amount} helperText={errors.amount?.message} />}
      />
      <Controller
        name="note"
        control={control}
        rules={{
          maxLength: { value: 35, message: TRANSACTION.NOTE_MAX },
        }}
        render={({ field }) => <TextField {...field} label="Not" fullWidth error={!!errors.note} helperText={errors.note?.message} />}
      />
    </>
  );
};

export default FormItems;
