import { WETH_ABI, WETH_CONTRACT_ADDRESS } from "@/constants";
import { ethers } from "ethers";

export async function getETHBalance(
  provider: ethers.BrowserProvider,
  address: string
) {
  const balanceInWei = await provider.getBalance(address);
  return Number(ethers.formatEther(balanceInWei)).toFixed(4);
}

export async function getWETHBalance(
  provider: ethers.BrowserProvider,
  address: string
) {
  const wethContract = new ethers.Contract(
    WETH_CONTRACT_ADDRESS,
    WETH_ABI,
    provider
  );
  const balance = await wethContract.balanceOf(address);
  const decimals = await wethContract.decimals();
  return ethers.formatUnits(balance, decimals);
}
