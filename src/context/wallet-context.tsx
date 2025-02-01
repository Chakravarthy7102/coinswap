"use client";

import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

import { useEffect } from "react";

type WalletContextType = {
  address: string | undefined;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  chainId: number | undefined;
  provider: ethers.BrowserProvider | undefined;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}

export default function WalletContextProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { ethereum } = window;

  const [address, setAddress] = useState<string | undefined>();
  const [provider, setProvider] = useState<
    ethers.BrowserProvider | undefined
  >();
  const [chainId, setChainId] = useState<number | undefined>();
  const [isConnecting, setIsConnecting] = useState(false);

  async function connect() {
    if (ethereum && !address) {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider(ethereum);
        setProvider(provider);

        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts.at(0);
        if (address) {
          setAddress(address);
        }
      } catch {
        alert("Failed to connect to metamask");
      } finally {
        setIsConnecting(false);
      }
    }
  }

  async function disconnect() {
    if (ethereum) {
      ethereum.request({
        method: "wallet_revokePermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    }
  }

  // internal method
  async function _fetchWalletConnectionInfo() {
    const provider = new ethers.BrowserProvider(ethereum);
    if (provider) {
      setProvider(provider);
      try {
        const network = await provider.getNetwork();
        const accounts = await provider.listAccounts();
        const address = accounts.at(0)?.address;

        if (address) {
          setAddress(address);
          setChainId(Number(network.chainId));
        }
      } catch {
        alert("Failed to list accounts");
      }
    }
  }

  // internal method
  async function _setupListeners() {
    if (typeof ethereum !== "undefined") {
      ethereum.on("accountsChanged", (accountsAddresses: string[]) => {
        if (accountsAddresses.length > 0) {
          setAddress(accountsAddresses[0]);
        } else {
          setAddress("");
        }
      });

      ethereum.on("chainChanged", (hexChainId: string) => {
        const chainId = parseInt(hexChainId, 16);
        setChainId(chainId);
      });
    } else {
      console.error("No wallet provider found");
    }
  }

  useEffect(() => {
    _fetchWalletConnectionInfo();
    _setupListeners();
    return () => {
      if (ethereum) {
        ethereum.removeAllListeners();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        chainId,
        connect,
        disconnect,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
