import { countries } from '@/constants';

const getCountryTurkishName = (countryCode: string) => {
  return countries.find(country => country.code === countryCode)?.turkishName ?? countryCode;
};

export default getCountryTurkishName;
