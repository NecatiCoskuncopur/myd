import createFedexPaper from '@/lib/carriers/fedex/createFedexPaper';
import createQuickShipperPaper from '@/lib/carriers/quickShipper/createQuickShipperPaper';
import createUpsPaper from '@/lib/carriers/ups/createUpsPaper';
import { CarrierTypes } from '@/types/carrier';

interface Credential {
  key: string;
  value: string;
}

interface CreateCarrierPaperParams extends Omit<CarrierTypes.ICarrierDriverParams, 'credentials'> {
  firm: string;
  credentials: Credential[];
}

interface CarrierResult {
  trackingNumber: string;
  label: string;
  invoice: string;
}

const carrierDrivers: Record<string, (params: CarrierTypes.ICarrierDriverParams) => Promise<CarrierResult>> = {
  FEDEX: createFedexPaper,
  UPS: createUpsPaper,
  QUICKSHIPPER: createQuickShipperPaper,
};

const createCarrierPaper = async ({ firm, credentials: credentialItems, ...params }: CreateCarrierPaperParams): Promise<CarrierResult> => {
  const driver = carrierDrivers[firm];

  if (!driver) {
    throw new Error(`Unsupported carrier: ${firm}`);
  }

  const credentials = credentialItems.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  const carrierCredentials = {
    FEDEX: {
      apiKey: credentials.apiKey,
      secretKey: credentials.secretKey,
    },
    UPS: {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    },
    QUICKSHIPPER: {
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
    },
  };

  return driver({
    ...params,
    credentials: carrierCredentials[firm as keyof typeof carrierCredentials],
  });
};

export default createCarrierPaper;
