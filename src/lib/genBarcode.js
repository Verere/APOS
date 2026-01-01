import { v4 as uuidv4 } from 'uuid';

/**
 * Convert UUID to a 12-digit number for EAN-13
 * and append check digit.
 */
export function generateEAN13FromUUID() {
  const uuid = uuidv4().replace(/-/g, ''); // remove dashes
  const numericString = uuid
    .split('')
    .map((char) => char.charCodeAt(0))
    .join('')
    .slice(0, 12); // Take first 12 digits only

  const checkDigit = calculateEAN13CheckDigit(numericString);
  return numericString + checkDigit;
}

function calculateEAN13CheckDigit(data) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(data[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}
