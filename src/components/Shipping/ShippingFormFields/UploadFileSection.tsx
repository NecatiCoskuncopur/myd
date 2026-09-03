'use client';

import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';

import compressPdf from '@/lib/compressPdf';

import Wrapper from './Wrapper';

type UploadFileSectionProps = {
  additionalDocument: File | null;
  setAdditionalDocument: Dispatch<SetStateAction<File | null>>;
};

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const UploadFileSection = ({ additionalDocument, setAdditionalDocument }: UploadFileSectionProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    setIsCompressing(true);
    setOriginalSize(null);

    try {
      const compressedFile = await compressPdf(file);

      const finalFile = compressedFile.size < file.size ? compressedFile : file;

      setAdditionalDocument(finalFile);

      if (finalFile.size < file.size) {
        setOriginalSize(file.size);
      }
    } catch {
      setAdditionalDocument(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemove = () => {
    setAdditionalDocument(null);
    setOriginalSize(null);
  };

  return (
    <Wrapper title="Ek Belge">
      <Box
        sx={theme => ({
          display: 'flex',
          alignItems: 'center',
          minHeight: 46,
          px: 1.25,
          py: 0.75,
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1.5,
        })}
      >
        {isCompressing ? (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: '100%',
              alignItems: 'center',
            }}
          >
            <CircularProgress size={18} />

            <Typography variant="body2" color="text.secondary">
              Belge sıkıştırılıyor...
            </Typography>
          </Stack>
        ) : additionalDocument ? (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: '100%',
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <DescriptionOutlinedIcon fontSize="small" color="action" />

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                {additionalDocument.name}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {originalSize ? `${formatFileSize(originalSize)} → ${formatFileSize(additionalDocument.size)}` : formatFileSize(additionalDocument.size)}
              </Typography>
            </Box>

            <Button
              component="label"
              size="small"
              variant="text"
              startIcon={<UploadFileOutlinedIcon />}
              sx={{
                flexShrink: 0,
                textTransform: 'none',
              }}
            >
              Değiştir
              <input hidden type="file" accept="application/pdf" onChange={handleFileChange} />
            </Button>

            <IconButton size="small" onClick={handleRemove} aria-label="Belgeyi kaldır">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Button
            component="label"
            size="small"
            variant="text"
            startIcon={<UploadFileOutlinedIcon />}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              textTransform: 'none',
            }}
          >
            PDF belge seç
            <input hidden type="file" accept="application/pdf" onChange={handleFileChange} />
          </Button>
        )}
      </Box>
    </Wrapper>
  );
};

export default UploadFileSection;
