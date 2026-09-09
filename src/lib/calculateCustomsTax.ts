import getCountryZone from '@/lib/getCountryZone';
import { SystemParam } from '@/models';

const calculateCustomsTax = async (customsValue: number, country: string): Promise<number> => {
  const zone = getCountryZone(country);

  if (!zone) {
    throw new Error(`Zone not found for country: ${country}`);
  }

  const key = `ZONE_${zone}_TAX_RATE`;

  const systemParam = await SystemParam.findOne({ key }).lean();

  if (!systemParam) {
    throw new Error(`Tax rate system parameter not found: ${key}`);
  }

  const taxRate = Number(systemParam.value);

  if (!Number.isFinite(taxRate)) {
    throw new Error(`Invalid tax rate for system parameter: ${key}`);
  }

  const taxAmount = customsValue * (taxRate / 100);
  return Number(taxAmount.toFixed(2));
};

export default calculateCustomsTax;
