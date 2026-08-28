import { useState } from 'react';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { Box, Button, Checkbox, FormHelperText, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material';

import { CarrierAccountTypes } from '@/types/carrierAccount';

type Props = {
  accounts: CarrierAccountTypes.ICarrierAccount[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

const BarcodePermitTransferList = ({ accounts, value, onChange, error }: Props) => {
  const [checked, setChecked] = useState<string[]>([]);

  const available = accounts.filter(account => !value.includes(account._id.toString()));

  const permitted = accounts.filter(account => value.includes(account._id.toString()));

  const toggle = (id: string) => {
    setChecked(current => (current.includes(id) ? current.filter(item => item !== id) : [...current, id]));
  };

  const moveRight = () => {
    const ids = checked.filter(id => !value.includes(id));

    onChange([...value, ...ids]);
    setChecked(current => current.filter(id => !ids.includes(id)));
  };

  const moveLeft = () => {
    const ids = checked.filter(id => value.includes(id));

    onChange(value.filter(id => !ids.includes(id)));
    setChecked(current => current.filter(id => !ids.includes(id)));
  };

  const renderList = (title: string, items: CarrierAccountTypes.ICarrierAccount[]) => (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2">{title}</Typography>
      </Box>

      <List
        dense
        sx={{
          height: 180,
          overflow: 'auto',
          py: 0.5,
        }}
      >
        {items.map(account => {
          const id = account._id.toString();
          const selected = checked.includes(id);

          return (
            <ListItemButton key={id} onClick={() => toggle(id)}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox edge="start" size="small" checked={selected} tabIndex={-1} disableRipple />
              </ListItemIcon>

              <ListItemText primary={account.name} />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );

  return (
    <>
      <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ display: 'block', mb: 0.75 }}>
        Barkod Yetkileri
      </Typography>

      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        spacing={1}
        sx={{ alignItems: 'stretch' }}
      >
        {renderList('Yetki Verilmemiş Hesaplar', available)}

        <Stack
          direction={{
            xs: 'row',
            md: 'column',
          }}
          spacing={1}
          sx={{ justifyContent: 'center' }}
        >
          <Button size="small" variant="outlined" onClick={moveRight} disabled={!checked.some(id => !value.includes(id))}>
            <KeyboardArrowDownRoundedIcon
              sx={{
                display: {
                  xs: 'block',
                  md: 'none',
                },
              }}
            />

            <ChevronRightRoundedIcon
              sx={{
                display: {
                  xs: 'none',
                  md: 'block',
                },
              }}
            />
          </Button>

          <Button size="small" variant="outlined" onClick={moveLeft} disabled={!checked.some(id => value.includes(id))}>
            <KeyboardArrowUpRoundedIcon
              sx={{
                display: {
                  xs: 'block',
                  md: 'none',
                },
              }}
            />

            <ChevronLeftRoundedIcon
              sx={{
                display: {
                  xs: 'none',
                  md: 'block',
                },
              }}
            />
          </Button>
        </Stack>

        {renderList('Yetkili Hesaplar', permitted)}
      </Stack>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </>
  );
};

export default BarcodePermitTransferList;
