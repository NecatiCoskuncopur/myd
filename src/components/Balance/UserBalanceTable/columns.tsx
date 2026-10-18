import NextLink from 'next/link';
import { alpha, Box, Chip, Divider, Link, Stack, Tooltip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import { BalanceTypes } from '@/types/balance';
import { getCountryFlagUrl } from '@/lib/getCountryFlags';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';

interface ICarrierCosts {
  amount?: number;
  dutiesAndTaxesCost?: number;
  insuranceCost?: number;
  longSideSurchargeCost?: number;
  serviceFee?: number;
}

export type BalanceRow = BalanceTypes.ISerializedTransaction & {
  id: string;
};

const COST_LABELS: Record<keyof Pick<ICarrierCosts, 'amount' | 'dutiesAndTaxesCost' | 'insuranceCost' | 'longSideSurchargeCost' | 'serviceFee'>, string> = {
  amount: 'Navlun Bedeli',
  dutiesAndTaxesCost: 'Gümrük & Vergi',
  insuranceCost: 'Sigorta Bedeli',
  longSideSurchargeCost: 'Uzun Kenar Ek Ücreti',
  serviceFee: 'DDP Hizmet Bedeli',
};

const CostBreakdownTooltip = ({ carrier, totalAmount }: { carrier: ICarrierCosts; totalAmount: number }) => {
  const breakdownItems = (Object.keys(COST_LABELS) as (keyof typeof COST_LABELS)[])
    .map(key => ({
      key,
      label: COST_LABELS[key],
      value: Number(carrier[key] ?? 0),
    }))
    .filter(item => item.value > 0);

  if (breakdownItems.length === 0) return null;

  return (
    <Box sx={{ p: 1, minWidth: 200 }}>
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
        {breakdownItems.map(item => (
          <Box
            key={item.key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
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
            Toplam:
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
              title={<CostBreakdownTooltip carrier={carrier} totalAmount={row.amount} />}
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
    field: 'country',
    headerName: 'Alıcı Ülkesi',
    flex: 1,
    minWidth: 120,
    renderCell: ({ row }) => {
      const shipping = typeof row.shippingId === 'object' && row.shippingId !== null ? row.shippingId : null;
      const country = shipping?.consignee?.address?.country || '-';

      const flagUrl = getCountryFlagUrl(country);
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            gap: 1,
            overflow: 'hidden',
          }}
        >
          {flagUrl && (
            <img
              src={flagUrl}
              alt={country}
              style={{
                width: '20px',
                height: '14px',
                objectFit: 'cover',
                borderRadius: '2px',
                display: 'block',
                flexShrink: 0,
              }}
            />
          )}
          <Typography variant="body2" noWrap>
            {country}
          </Typography>
        </Box>
      );
    },
  },

  {
    field: 'packageInfo',
    headerName: 'Paket',
    flex: 1,
    minWidth: 100,
    renderCell: params => {
      const shipping = typeof params.row.shippingId === 'object' && params.row.shippingId !== null ? params.row.shippingId : null;
      const count = shipping?.package?.numberOfPackage ?? '-';

      const weight = shipping?.package?.weight ?? '-';

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
              <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                Adet:
              </Box>
              {count}
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
              <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                Desi/KG:
              </Box>
              {weight}
            </Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'trackingNumber',
    headerName: 'Takip Numarası',
    flex: 1,
    minWidth: 150,
    renderCell: ({ row }) => {
      const shipping = typeof row.shippingId === 'object' && row.shippingId !== null ? row.shippingId : null;
      const trackingNo = shipping?.carrier?.trackingNumber || '-';

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {trackingNo !== '-' ? (
            <Typography variant="body2" sx={{ userSelect: 'all' }}>
              {trackingNo}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              -
            </Typography>
          )}
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
              href={`/panel/gonderilerim/${shippingTargetId}`}
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
