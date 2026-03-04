import { countries } from '@/constants';

/**
 * Verilen ISO ülke koduna göre ülke bilgisini döner.
 *
 * @param countryCode - ISO 3166-1 alpha-2 ülke kodu (örn: TR, US)
 * @returns Eşleşen ülke objesi veya eşleşme bulunamazsa undefined
 */

const getCountry = (countryCode: string) => {
  return countries.find(country => country.code === countryCode);
};

export default getCountry;
