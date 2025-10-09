import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates a Colombian NIT.
 * @param nit The NIT string, e.g., "900123456-1".
 * @returns True if the NIT is valid, false otherwise.
 */
export function validateNit(nit: string): boolean {
  if (!/^\d{9}-\d{1}$/.test(nit) && !/^\d{1,9}$/.test(nit.replace('-', ''))) {
    // Allows NIT with or without hyphen, but validates format.
    // Basic format check, allows formats like 123456789-1 or 1234567891
    if (!/^\d{1,9}-?\d{1}$/.test(nit)) return false;
  }
  
  const nitClean = nit.replace('-', '');
  if (nitClean.length < 4 || nitClean.length > 10) return false;

  const nitNumber = nitClean.substring(0, nitClean.length - 1);
  const verificationDigit = nitClean.substring(nitClean.length - 1);

  const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  
  let sum = 0;
  // Pad with zeros to the left to match weight array length.
  const paddedNit = nitNumber.padStart(weights.length, '0');

  for (let i = 0; i < paddedNit.length; i++) {
    sum += parseInt(paddedNit[i], 10) * weights[i];
  }

  const remainder = sum % 11;
  let calculatedDigit;

  if (remainder === 0 || remainder === 1) {
    calculatedDigit = remainder;
  } else {
    calculatedDigit = 11 - remainder;
  }

  return calculatedDigit === parseInt(verificationDigit, 10);
}
