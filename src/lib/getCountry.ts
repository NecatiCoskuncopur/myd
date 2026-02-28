import { countries } from '@/constants';

/**
 * Ülke koduna göre ülke bilgisini döner
 *
 * @param countryCode - ISO ülke kodu (örn: TR, US)
 */

const getCountry = (countryCode: string) => {
  return countries.find(country => country.code === countryCode);
};

export default getCountry;
