import countries from '@/constants/countries';

const normalize = (value: string) => value.trim().toLocaleLowerCase('tr-TR');

const getCountryZone = (country: string): number | null => {
  const normalizedCountry = normalize(country);

  const matchedCountry = countries.find(
    item => normalize(item.name) === normalizedCountry || normalize(item.turkishName) === normalizedCountry || normalize(item.code) === normalizedCountry,
  );

  return matchedCountry?.zone ?? null;
};

export default getCountryZone;
