export const toNumber = (value: unknown) => {
  const parsed = parseFloat(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const compoundFutureValue = (principal: number, annualRatePercent: number, years: number, compoundsPerYear = 1) => {
  const rate = annualRatePercent / 100;
  return principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
};

export const sipFutureValue = (sipAmount: number, annualRatePercent: number, years: number, installmentsPerYear = 12) => {
  const totalInstallments = years * installmentsPerYear;
  const periodicRate = annualRatePercent / 100 / installmentsPerYear;

  if (periodicRate <= 0) return sipAmount * totalInstallments;

  return sipAmount * ((Math.pow(1 + periodicRate, totalInstallments) - 1) / periodicRate) * (1 + periodicRate);
};

export const formatProjectionYears = [1, 3, 5, 10] as const;
