/**
 * Format a number as currency ($X.XX).
 */
export function formatCurrency(value: number): string {
  return '$' + value.toFixed(2);
}

/**
 * Format a number as a percentage (X.XX%).
 */
export function formatPercent(value: number, decimals = 2): string {
  return (value * 100).toFixed(decimals) + '%';
}
