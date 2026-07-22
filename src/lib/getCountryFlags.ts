/**
 * ISO ülke koduna göre SVG bayrak URL'i döndürür.
 * Örn: 'US' -> 'https://flagcdn.com/w40/us.png'
 */
export const getCountryFlagUrl = (countryCode?: string): string | null => {
  if (!countryCode || countryCode.length !== 2) return null;
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};
