/** Format a ZAR amount as "R 55 000" (space-grouped, no decimals). */
export function formatZAR(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `R ${grouped}`;
}
