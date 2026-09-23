import NextLink from 'next/link';
import { alpha, Box, Chip, Divider, Link, Stack, Tooltip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import { BalanceTypes } from '@/types/balance';

interface ICarrierCosts {
  cost?: number;
  amount?: number;
  dutiesAndTaxesCost?: number;
  insuranceCost?: number;
  longSideSurchargeCost?: number;
  serviceFee?: number;
}

export type BalanceRow = BalanceTypes.ISerializedTransaction & {
  id: string;
};

const CUSTOMER_CHARGE_LABELS: Record<
  keyof Pick<ICarrierCosts, 'amount' | 'dutiesAndTaxesCost' | 'insuranceCost' | 'longSideSurchargeCost' | 'serviceFee'>,
  string
> = {
  amount: 'Navlun Satış',
  dutiesAndTaxesCost: 'Gümrük & Vergi',
  insuranceCost: 'Sigorta Bedeli',
  longSideSurchargeCost: 'Uzun Kenar Ek Ücreti',
  serviceFee: 'DDP Hizmet Bedeli',
};

const AdminCostBreakdownTooltip = ({ carrier, totalAmount }: { carrier: ICarrierCosts; totalAmount: number }) => {
  const chargeItems = (Object.keys(CUSTOMER_CHARGE_LABELS) as (keyof typeof CUSTOMER_CHARGE_LABELS)[])
    .map(key => ({
      key,
      label: CUSTOMER_CHARGE_LABELS[key],
      value: Number(carrier[key] ?? 0),
    }))
    .filter(item => item.value > 0);

  const hasCost = typeof carrier.cost === 'number' && carrier.cost > 0;

  if (chargeItems.length === 0 && !hasCost) return null;

  return (
    <Box sx={{ p: 1, minWidth: 220 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'block',
          mb: 1,
        }}
      >
        Ücretlendirme
      </Typography>

      <Stack spacing={0.75}>
        {hasCost && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              Taşıyıcı Maliyeti:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
              {Number(carrier.cost).toFixed(2)}$
            </Typography>
          </Box>
        )}

        {chargeItems.map(item => (
          <Box
            key={item.key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              {item.label}:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
              {item.value.toFixed(2)}$
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 0.5, borderColor: 'divider' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Müşteriden Kesilen:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
            {totalAmount.toFixed(2)}$
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

const columns: GridColDef<BalanceRow>[] = [
  {
    field: 'amount',
    headerName: 'İşlem Tutarı',
    flex: 1,
    minWidth: 160,
    renderCell: ({ row }) => {
      const isSpend = row.transactionType === 'SPEND';
      const shipping = typeof row.shippingId === 'object' && row.shippingId !== null ? row.shippingId : null;
      const carrier = shipping && 'carrier' in shipping ? (shipping.carrier as ICarrierCosts) : null;

      const hasBreakdown = isSpend && Boolean(carrier);

      const amountTypography = (
        <Typography
          sx={{
            fontWeight: 700,
            color: isSpend ? 'error.main' : 'success.main',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: hasBreakdown ? 'help' : 'default',
            textDecoration: hasBreakdown ? 'underline dotted' : 'none',
            textUnderlineOffset: '4px',
            textDecorationColor: theme => alpha(theme.palette.error.main, 0.4),
          }}
        >
          {isSpend ? '-' : '+'}
          {row.amount.toFixed(2)}$
        </Typography>
      );

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {hasBreakdown && carrier ? (
            <Tooltip
              title={<AdminCostBreakdownTooltip carrier={carrier} totalAmount={row.amount} />}
              arrow
              placement="top-start"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: theme => theme.shadows[8],
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  },
                },
                arrow: {
                  sx: {
                    color: 'background.paper',
                    '&::before': {
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  },
                },
              }}
            >
              {amountTypography}
            </Tooltip>
          ) : (
            amountTypography
          )}
        </Box>
      );
    },
  },
  {
    field: 'transactionType',
    headerName: 'İşlem Tipi',
    flex: 1,
    minWidth: 140,
    renderCell: ({ row }) => {
      const isSpend = row.transactionType === 'SPEND';
      const isPay = row.transactionType === 'PAY';
      const label = isSpend ? 'Harcama' : isPay ? 'Ödeme' : 'Bilinmiyor';

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={label}
            size="small"
            sx={theme => {
              const palette = isPay ? theme.palette.success : theme.palette.error;

              return {
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.02em',
                borderRadius: '6px',
                backgroundColor: alpha(palette.main, 0.12),
                color: palette.main,
                border: '1px solid',
                borderColor: alpha(palette.main, 0.25),
              };
            }}
          />
        </Box>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Tarih',
    flex: 1,
    minWidth: 170,
    renderCell: ({ row }) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          color: 'text.secondary',
        }}
      >
        {moment(row.createdAt).format('DD.MM.YYYY HH:mm')}
      </Box>
    ),
  },
  {
    field: 'shippingId',
    headerName: 'İşlemler',
    flex: 1.5,
    minWidth: 200,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => {
      const shipping = typeof row.shippingId === 'object' && row.shippingId !== null ? row.shippingId : null;
      const shippingTargetId = shipping && '_id' in shipping ? String(shipping._id) : typeof row.shippingId === 'string' ? row.shippingId : null;

      if (shippingTargetId) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Link
              component={NextLink}
              href={`/admin/gonderiler/${shippingTargetId}`}
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Gönderiye Git
            </Link>
          </Box>
        );
      }

      if (row.note) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Tooltip title={row.note} arrow>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 200,
                }}
              >
                {row.note}
              </Typography>
            </Tooltip>
          </Box>
        );
      }

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            -
          </Typography>
        </Box>
      );
    },
  },
];

export default columns;
