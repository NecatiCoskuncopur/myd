const formatHsCode = (hsCode: string, countryCode: string): string => {
  const cleanCode = String(hsCode).replace(/\D/g, '').trim();
  const upperCountry = countryCode.toUpperCase();

  const tenDigitCountries = ['US'];

  if (tenDigitCountries.includes(upperCountry)) {
    return cleanCode.slice(0, 10);
  }

  return cleanCode.slice(0, 8);
};

export default formatHsCode;
