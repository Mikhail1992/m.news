export const getParcedLimit = (limit: number, defaultValue: number, maxValue: number): number => {
  return limit ? (limit > maxValue ? maxValue : limit) : defaultValue;
};
