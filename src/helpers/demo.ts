/*
The helpers folder stores reusable utility functions for tasks like API handling (getApiURL, handleApiError),
data formatting (formatDate, formatCurrency), local storage management (saveToLocalStorage),
performance optimizations (debounce, throttle), validations (isValidEmail), and calculations (calculatePercentage).
These functions improve reusability, keep code clean, and ensure consistency across your application.
*/

// example:
// helpers/envHelpers.ts
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_HELP_SERVICE_URL || '';
};
