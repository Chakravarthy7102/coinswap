import { BigNumberish, ethers } from "ethers";

export function truncateAddress(address: string) {
  const startLength = 6;
  const endLength = 4;
  if (!address || address.length < startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

const READABLE_FORM_LEN = 4;

export function fromReadableAmount(
  amount: string,
  decimals: number
): BigNumberish {
  return ethers.parseUnits(amount, decimals);
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
  return ethers.formatUnits(rawAmount, decimals).slice(0, READABLE_FORM_LEN);
}
