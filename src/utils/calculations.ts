import { ethers } from "ethers";

export const estimateGasCostInToken = async (
  provider: ethers.BrowserProvider,
  swapRate: number
) => {
  const gasPrice = await provider.getFeeData();
  const estimatedGas = ethers.toBigInt(150000);

  const gasCostWei = (gasPrice.gasPrice || BigInt(0)) * estimatedGas;
  const gasCostETH = ethers.formatUnits(gasCostWei, 18);

  const gasCostInTokenB = parseFloat(gasCostETH) * swapRate;

  return gasCostInTokenB;
};
