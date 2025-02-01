import { getETHBalance, getWETHBalance } from "@/utils/wallet";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

type UseBalancesReturnType = {
  ethBalance: string;
  wEthBalance: string;
  refetchBalances: () => Promise<void>;
};

export default function useBalances({
  address,
  provider,
}: {
  provider: ethers.BrowserProvider;
  address: string;
}): UseBalancesReturnType {
  const [ethBalance, setETHBalance] = useState("0");
  const [wEthBalance, setWETHBalance] = useState("0");

  // internal
  async function _fetchWethBalance() {
    try {
      const weth = await getWETHBalance(provider, address);
      setWETHBalance(weth);
    } catch {
      alert("Failed to fetch WETH balance");
    }
  }

  // internal
  async function _fetchEthBalance() {
    try {
      const eth = await getETHBalance(provider, address);
      setETHBalance(eth);
    } catch {
      alert("Failed to fetch ETH balance");
    }
  }

  async function fetchBalances() {
    await Promise.all([_fetchEthBalance(), _fetchWethBalance()]);
  }

  useEffect(() => {
    fetchBalances();
  }, [provider, address]);

  return {
    ethBalance,
    wEthBalance,
    refetchBalances: fetchBalances,
  };
}
