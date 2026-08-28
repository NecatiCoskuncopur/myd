'use client';

import { useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { DataGrid, GridPaginationModel } from '@mui/x-data-grid';

import getBalanceData from '@/app/actions/admin/getBalanceData';
import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { BalanceTypes } from '@/types/balance';

import columns from './columns';
import CurrentBalance from './CurrentBalance';

interface BalanceTransactionsProps {
  userId: string;
  open: boolean;
  userName: string;
  onClose: () => void;
}

const DEFAULT_LIMIT = 5;

const BalanceTransactions = ({ userId, open, userName, onClose }: BalanceTransactionsProps) => {
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState<BalanceTypes.IUserBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: DEFAULT_LIMIT,
  });

  useEffect(() => {
    if (!open || !userId) return;

    let isActive = true;

    const fetchBalance = async () => {
      setIsLoading(true);

      try {
        const response = await getBalanceData({
          userId,
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
        });

        if (!isActive) return;

        if (response.status !== 'OK' || !response.data) {
          setData(null);

          showSnackbar(response.message ?? generalMessages.UNEXPECTED_ERROR, 'error');

          return;
        }

        setData(response.data);
      } catch {
        if (!isActive) return;

        setData(null);

        showSnackbar(generalMessages.UNEXPECTED_ERROR, 'error');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchBalance();

    return () => {
      isActive = false;
    };
  }, [open, userId, paginationModel.page, paginationModel.pageSize, showSnackbar]);

  useEffect(() => {
    if (!open) return;

    setData(null);

    setPaginationModel({
      page: 0,
      pageSize: DEFAULT_LIMIT,
    });
  }, [open, userId]);

  type BalanceRow = BalanceTypes.IUserBalanceData['transactions'][number] & {
    id: string;
  };

  const rows: BalanceRow[] =
    data?.transactions.map((transaction, index) => ({
      ...transaction,
      id: `${transaction.createdAt}-${index}`,
    })) ?? [];

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          pr: 6,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '1.25rem',
            fontWeight: 500,
          }}
        >
          {userName ? `${userName} adlı kullanıcıya ait bakiye hareketleri` : 'Bakiye Hareketleri'}
        </Box>

        <CurrentBalance total={data?.total ?? 0} />
      </DialogTitle>

      <DialogContent>
        <Box sx={{ height: 430, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            rowCount={data?.totalCount ?? 0}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BalanceTransactions;
