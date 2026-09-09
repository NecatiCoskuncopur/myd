import { SystemParam } from '@/models';

const getInsuranceRate = async (): Promise<number> => {
  const systemParam = await SystemParam.findOne({
    key: 'INSURANCE_RATE',
  }).lean();

  if (!systemParam) {
    throw new Error('Insurance rate system parameter not found');
  }

  const insuranceRate = Number(systemParam.value);

  if (!Number.isFinite(insuranceRate)) {
    throw new Error('Invalid insurance rate system parameter');
  }

  return insuranceRate;
};

export default getInsuranceRate;
