export default function toFixed(amount: number, digits: number): number {
  return parseFloat(amount.toFixed(digits));
}
