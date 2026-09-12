import { AdditionalDocumentEnum } from '@/constants';

const additionalDocumentOptions = [
  {
    value: AdditionalDocumentEnum.CERTIFICATE_OF_ORIGIN,
    label: 'Menşe Şahadetnamesi',
  },
  {
    value: AdditionalDocumentEnum.COMMERCIAL_INVOICE,
    label: 'Ticari Fatura',
  },
  {
    value: AdditionalDocumentEnum.OTHER,
    label: 'Diğer',
  },
];

export default additionalDocumentOptions;
