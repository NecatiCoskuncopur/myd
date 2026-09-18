'use client';

import { type Dispatch, type MouseEvent, type SetStateAction, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, CircularProgress, ClickAwayListener, MenuItem, MenuList, Paper, Popper, Typography } from '@mui/material';

import createBarcode from '@/app/actions/shipping/createBarcode';
import { generalMessages } from '@/constants';
import getCarrierIcon from '@/lib/getCarrierIcon';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { ShippingTypes } from '@/types/shipping';

import BulkBarcodeDialog, { type BulkBarcodeItem } from './BulkBarcodeDialog';

const { UNEXPECTED_ERROR } = generalMessages;

interface BulkBarcodeProps {
  shippings: ShippingTypes.IShipping[];
  accounts: CarrierAccountTypes.IUserPermittedAccount[];
  onSelectionChange: Dispatch<SetStateAction<string[]>>;
  onComplete: () => Promise<unknown> | void;
}

const BulkBarcode = ({ shippings, accounts, onSelectionChange, onComplete }: BulkBarcodeProps) => {
  const { showSnackbar } = useSnackbar();
  const pathName = usePathname();

  const isAdmin = pathName.includes('yonetim');

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState<BulkBarcodeItem[]>([]);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const menuOpen = Boolean(anchorEl);
  const disabled = shippings.length === 0 || loading;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) {
      return;
    }

    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }

    clearCloseTimer();

    setAnchorEl(event.currentTarget);
  };

  const handleKeepMenuOpen = () => {
    clearCloseTimer();
  };

  const handleCloseMenu = () => {
    clearCloseTimer();

    closeTimerRef.current = setTimeout(() => {
      setAnchorEl(null);
      closeTimerRef.current = null;
    }, 200);
  };

  const handleCloseMenuImmediately = () => {
    clearCloseTimer();

    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    if (loading) {
      return;
    }

    setDialogOpen(false);
    setItems([]);
  };

  const updateItem = (shippingId: string, values: Partial<Omit<BulkBarcodeItem, 'shipping'>>) => {
    setItems(current =>
      current.map(item =>
        item.shipping._id === shippingId
          ? {
              ...item,
              ...values,
            }
          : item,
      ),
    );
  };

  const handleCreateBarcodes = async (account: CarrierAccountTypes.IUserPermittedAccount) => {
    if (!account.carrier || !account.accountNumber || !account._id || !account.displayName || shippings.length === 0) {
      return;
    }

    handleCloseMenuImmediately();

    const selectedShippings = [...shippings];

    setItems(
      selectedShippings.map(shipping => ({
        shipping,
        status: 'waiting',
      })),
    );

    setDialogOpen(true);
    setLoading(true);

    const failedIds: string[] = [];

    let successCount = 0;

    try {
      for (const shipping of selectedShippings) {
        const shippingId = shipping._id;

        updateItem(shippingId, {
          status: 'processing',
          error: undefined,
        });

        try {
          const response = await createBarcode({
            displayName: account.displayName,
            shippingId,
            firm: account.carrier,
            accountNumber: account.accountNumber,
            carrierAccountId: account._id.toString(),
          });

          if (response.status !== 'OK') {
            failedIds.push(shippingId);

            updateItem(shippingId, {
              status: 'error',
              error: response.message ?? 'Barkod oluşturulamadı.',
            });

            continue;
          }

          successCount += 1;

          updateItem(shippingId, {
            status: 'success',
            error: undefined,
          });
        } catch (error) {
          failedIds.push(shippingId);

          updateItem(shippingId, {
            status: 'error',
            error: error instanceof Error ? error.message : UNEXPECTED_ERROR,
          });
        }
      }
      onSelectionChange(failedIds);

      if (successCount > 0) {
        await onComplete();
      }
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : UNEXPECTED_ERROR, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <Box
          onMouseEnter={handleOpenMenu}
          onMouseLeave={handleCloseMenu}
          sx={{
            minWidth: 220,
            px: 2,
            py: 1,
            borderRadius: 1,
            bgcolor: disabled ? 'action.disabledBackground' : 'primary.main',
            color: disabled ? 'text.disabled' : 'primary.contrastText',
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            userSelect: 'none',
          }}
        >
          {loading && <CircularProgress size={16} color="inherit" />}

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
            }}
          >
            {loading ? 'Barkodlar Oluşturuluyor' : `Toplu Barkod Oluştur (${shippings.length})`}
          </Typography>
        </Box>

        <Popper
          open={menuOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{
            zIndex: theme => theme.zIndex.modal,
          }}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 4],
              },
            },
          ]}
        >
          <ClickAwayListener onClickAway={handleCloseMenuImmediately}>
            <Paper
              onMouseEnter={handleKeepMenuOpen}
              onMouseLeave={handleCloseMenu}
              sx={{
                width: anchorEl?.clientWidth,
              }}
            >
              <MenuList disablePadding>
                {accounts.map(account => {
                  const icon = getCarrierIcon(account.carrier);
                  const accountName = isAdmin ? account.name : account.displayName;

                  return (
                    <MenuItem
                      key={account._id?.toString()}
                      onClick={() => {
                        void handleCreateBarcodes(account);
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          width: '100%',
                        }}
                      >
                        {isAdmin && icon}

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                          }}
                        >
                          {accountName}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>

      <BulkBarcodeDialog open={dialogOpen} loading={loading} items={items} onClose={handleCloseDialog} />
    </>
  );
};

export default BulkBarcode;
