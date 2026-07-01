export type CountryOption = {
  code: string;
  country: string;
  label: string;
  langCode: string;
};

export const COUNTRIES: CountryOption[] = [
  { code: "bd", country: "বাংলাদেশ", label: "বাংলা", langCode: "bn" },
  { code: "us", country: "English", label: "English", langCode: "en" },
];
