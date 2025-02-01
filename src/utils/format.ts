export function truncateAddress(address: string) {
  const startLength = 6;
  const endLength = 4;
  if (!address || address.length < startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}
