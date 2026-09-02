import { TrackingStatusEnum } from '@/constants';

const normalize = (status: string) => status.trim().toUpperCase();

const normalizeCarrierTrackingStatus = (firm: string, status: string): TrackingStatusEnum => {
  const normalizedStatus = normalize(status);

  switch (firm) {
    case 'FEDEX': {
      switch (normalizedStatus) {
        case 'SHIPMENT INFORMATION SENT':
          return TrackingStatusEnum.CREATED;

        case 'PICKED UP':
          return TrackingStatusEnum.PICKED_UP;

        case 'IN TRANSIT':
        case 'ON THE WAY':
        case 'READY FOR PICKUP':
          return TrackingStatusEnum.IN_TRANSIT;

        case 'OUT FOR DELIVERY':
          return TrackingStatusEnum.OUT_FOR_DELIVERY;

        case 'DELIVERED':
          return TrackingStatusEnum.DELIVERED;

        case 'CANCELLED':
        case 'CANCELED':
          return TrackingStatusEnum.CANCELLED;

        case 'EXCEPTION':
          return TrackingStatusEnum.EXCEPTION;

        default:
          return TrackingStatusEnum.UNKNOWN;
      }
    }

    case 'UPS': {
      switch (normalizedStatus) {
        case 'LABEL CREATED':
          return TrackingStatusEnum.CREATED;

        case 'ON THE WAY':
        case 'IN TRANSIT':
          return TrackingStatusEnum.IN_TRANSIT;

        case 'OUT FOR DELIVERY':
          return TrackingStatusEnum.OUT_FOR_DELIVERY;

        case 'DELIVERED':
          return TrackingStatusEnum.DELIVERED;

        case 'EXCEPTION':
          return TrackingStatusEnum.EXCEPTION;

        case 'RETURNING TO SENDER':
        case 'RETURNED':
          return TrackingStatusEnum.RETURNED;

        default:
          return TrackingStatusEnum.UNKNOWN;
      }
    }

    case 'QUICKSHIPPER': {
      switch (normalizedStatus) {
        case 'DAĞITIM MERKEZİNDE':
          return TrackingStatusEnum.IN_TRANSIT;

        case 'DAĞITIMA ÇIKTI':
          return TrackingStatusEnum.OUT_FOR_DELIVERY;

        case 'TESLİM EDİLDİ':
          return TrackingStatusEnum.DELIVERED;

        case 'İPTAL EDİLDİ':
        case 'İPTAL':
          return TrackingStatusEnum.CANCELLED;

        case 'İADE':
        case 'İADE EDİLDİ':
          return TrackingStatusEnum.RETURNED;

        default:
          return TrackingStatusEnum.UNKNOWN;
      }
    }

    default:
      return TrackingStatusEnum.UNKNOWN;
  }
};

export default normalizeCarrierTrackingStatus;
