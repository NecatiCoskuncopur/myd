'use client';

import { ChangeEvent, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { Box, Button, CircularProgress, Grid, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';

import deleteAdditionalDocument from '@/app/actions/additionalDocument/deleteAdditionalDocument';
import getAdditionalDocument from '@/app/actions/additionalDocument/getAdditionalDocument';
import saveAdditionalDocument from '@/app/actions/additionalDocument/saveAdditionalDocument';
import {
  AdditionalDocumentContentTypeEnum,
  AdditionalDocumentEnum,
  additionalDocumentMessages,
  additionalDocumentOptions,
  generalMessages,
  MAX_DOCUMENT_SIZE,
} from '@/constants';
import compressImage from '@/lib/compressImage';
import compressPdf from '@/lib/compressPdf';
import openBase64File from '@/lib/openBase64File';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { AdditionalDocumentTypes } from '@/types/additionalDocument';

import Wrapper from './Wrapper';

const { UNEXPECTED_ERROR } = generalMessages;
const { FILE } = additionalDocumentMessages;

type AdditionalDocumentsSectionProps =
  | {
      mode: 'create';
      onDocumentSaved: (id: string) => void;
      onDocumentDeleted: (id: string) => void;
    }
  | {
      mode: 'edit';
      shippingId: string;
      initialDocuments: AdditionalDocumentTypes.IAdditionalDocument[];
    };

type DocumentRow = {
  localId: string;
  id?: string;
  file: File | null;
  type: AdditionalDocumentEnum;
  contentType?: AdditionalDocumentContentTypeEnum;
  isSaving: boolean;
  isDeleting: boolean;
};

const createEmptyRow = (): DocumentRow => ({
  localId: crypto.randomUUID(),
  file: null,
  type: AdditionalDocumentEnum.OTHER,
  isSaving: false,
  isDeleting: false,
});

const AdditionalDocumentsSection = (props: AdditionalDocumentsSectionProps) => {
  const { showSnackbar } = useSnackbar();

  const [documents, setDocuments] = useState<DocumentRow[]>(() => {
    if (props.mode === 'edit') {
      const initialDocuments = props.initialDocuments ?? [];

      if (initialDocuments.length) {
        return initialDocuments.map(document => ({
          localId: document.id,
          id: document.id,
          file: null,
          type: document.type,
          contentType: document.contentType,
          isSaving: false,
          isDeleting: false,
        }));
      }
    }

    return [createEmptyRow()];
  });

  const updateRow = (localId: string, values: Partial<DocumentRow>) => {
    setDocuments(prev =>
      prev.map(document =>
        document.localId === localId
          ? {
              ...document,
              ...values,
            }
          : document,
      ),
    );
  };

  const handleFileChange = async (localId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      let compressedFile = file;

      if (file.type === 'application/pdf') {
        compressedFile = await compressPdf(file);
      }

      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        compressedFile = await compressImage(file);
      }

      const finalFile = compressedFile.size < file.size ? compressedFile : file;

      if (finalFile.size > MAX_DOCUMENT_SIZE) {
        showSnackbar(FILE.SIZE, 'error');

        return;
      }

      updateRow(localId, {
        file: finalFile,
      });
    } catch {
      showSnackbar('Belge sıkıştırılırken bir hata oluştu.', 'error');
    }
  };

  const handleAddRow = () => {
    setDocuments(prev => [...prev, createEmptyRow()]);
  };

  const handleSave = async (document: DocumentRow) => {
    if (!document.file || document.id) {
      return;
    }

    updateRow(document.localId, {
      isSaving: true,
    });

    try {
      const response = await saveAdditionalDocument({
        file: document.file,
        type: document.type,
        shippingId: props.mode === 'edit' ? props.shippingId : undefined,
      });

      if (response.status !== 'OK' || !response.data?.id) {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      updateRow(document.localId, {
        id: response.data.id,
      });

      if (props.mode === 'create') {
        props.onDocumentSaved(response.data.id);
      }

      showSnackbar(response.message ?? 'Belge kaydedildi.', 'success');
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    } finally {
      updateRow(document.localId, {
        isSaving: false,
      });
    }
  };

  const handleDelete = async (document: DocumentRow) => {
    if (!document.id) {
      setDocuments(prev => prev.filter(item => item.localId !== document.localId));

      return;
    }

    updateRow(document.localId, {
      isDeleting: true,
    });

    try {
      const response = await deleteAdditionalDocument(document.id);

      if (response.status !== 'OK') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      if (props.mode === 'create') {
        props.onDocumentDeleted(document.id);
      }

      setDocuments(prev => prev.filter(item => item.localId !== document.localId));

      showSnackbar(response.message ?? 'Belge silindi.', 'success');
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    } finally {
      updateRow(document.localId, {
        isDeleting: false,
      });
    }
  };

  const handleOpenDocument = async (additionalDocumentId: string) => {
    try {
      const response = await getAdditionalDocument(additionalDocumentId);

      if (response.status !== 'OK' || !response.data?.file || !response.data?.contentType) {
        showSnackbar(response.message ?? 'Belge alınırken bir hata oluştu.', 'error');

        return;
      }

      openBase64File(response.data.file, response.data.contentType);
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  const maxDocumentCount = Object.values(AdditionalDocumentEnum).length;

  return (
    <Wrapper title="Ek Belgeler">
      <Stack
        spacing={1}
        sx={{
          width: '100%',
        }}
      >
        {documents.map(document => {
          const isSaved = Boolean(document.id);

          return (
            <Grid
              container
              spacing={1}
              key={document.localId}
              sx={{
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={document.type}
                  disabled={isSaved}
                  onChange={event =>
                    updateRow(document.localId, {
                      type: event.target.value as AdditionalDocumentEnum,
                    })
                  }
                >
                  {additionalDocumentOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 5,
                }}
              >
                <Box
                  sx={theme => ({
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    minWidth: 0,
                    minHeight: 40,
                    px: 1,
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: 1,
                  })}
                >
                  {document.file ? (
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {document.file.name}
                    </Typography>
                  ) : isSaved && document.id ? (
                    <Button
                      type="button"
                      size="small"
                      startIcon={<OpenInNewOutlinedIcon fontSize="small" />}
                      onClick={() => {
                        void handleOpenDocument(document.id!);
                      }}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                      }}
                    >
                      Belgeyi Görüntüle
                    </Button>
                  ) : (
                    <Button
                      component="label"
                      type="button"
                      size="small"
                      startIcon={<UploadFileOutlinedIcon />}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                      }}
                    >
                      PDF, JPG veya PNG seç
                      <input hidden type="file" accept="application/pdf,image/jpeg,image/png" onChange={event => handleFileChange(document.localId, event)} />
                    </Button>
                  )}
                </Box>
              </Grid>

              <Grid
                size={{
                  xs: 10,
                  md: 2,
                }}
              >
                {isSaved ? (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 40,
                    }}
                  >
                    <CheckCircleIcon color="success" fontSize="small" />

                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Kaydedildi
                    </Typography>
                  </Stack>
                ) : (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled={!document.file || document.isSaving}
                    onClick={() => handleSave(document)}
                    sx={{
                      minHeight: 40,
                    }}
                  >
                    {document.isSaving ? <CircularProgress size={18} /> : 'Kaydet'}
                  </Button>
                )}
              </Grid>

              <Grid
                size={{
                  xs: 2,
                  md: 1,
                }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <IconButton
                  type="button"
                  size="small"
                  disabled={document.isSaving || document.isDeleting}
                  onClick={() => handleDelete(document)}
                  aria-label="Belgeyi kaldır"
                >
                  {document.isDeleting ? <CircularProgress size={18} /> : <CloseIcon fontSize="small" />}
                </IconButton>
              </Grid>
            </Grid>
          );
        })}

        {documents.length < maxDocumentCount && (
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={handleAddRow}
            sx={{
              width: '100%',
            }}
          >
            + Farklı Belge Ekle
          </Button>
        )}
      </Stack>
    </Wrapper>
  );
};

export default AdditionalDocumentsSection;
