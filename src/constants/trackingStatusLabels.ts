import { TrackingStatusEnum } from '@/constants';

const TrackingStatusLabels: Record<TrackingStatusEnum, string> = {
  [TrackingStatusEnum.CREATED]: 'Oluşturuldu',
  [TrackingStatusEnum.PICKED_UP]: 'Teslim Alındı',
  [TrackingStatusEnum.IN_TRANSIT]: 'Transfer Sürecinde',
  [TrackingStatusEnum.OUT_FOR_DELIVERY]: 'Dağıtıma Çıktı',
  [TrackingStatusEnum.DELIVERED]: 'Teslim Edildi',
  [TrackingStatusEnum.EXCEPTION]: 'Sorun Oluştu',
  [TrackingStatusEnum.RETURNED]: 'İade Edildi',
  [TrackingStatusEnum.CANCELLED]: 'İptal Edildi',
  [TrackingStatusEnum.UNKNOWN]: 'Bilinmiyor',
};

export default TrackingStatusLabels;
