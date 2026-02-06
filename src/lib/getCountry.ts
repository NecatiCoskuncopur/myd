import { countries } from '@/constants';

const getCountry = (countryCode: string) => {
  return countries.find(country => country.code === countryCode);
};

export default getCountry;
