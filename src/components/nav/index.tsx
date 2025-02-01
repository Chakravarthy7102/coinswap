"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/wallet-context";
import { Bird, Gem, Power } from "lucide-react";
import { truncateAddress } from "@/utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getETHBalance, getWETHBalance } from "@/utils/wallet";

export default function Navbar() {
  const { address, connect, disconnect, isConnecting, provider } = useWallet();

  return (
    <nav className="flex items-center justify-between px-8 py-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Bird className="text-primary size-7" /> CoinSwap
      </h3>
      {address && provider ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="font-semibold">
              <Gem />
              {truncateAddress(address)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-x-2 font-mono text-sm font-semibold text-primary">
              <Gem className="bg-primary/30 p-1 size-6 rounded-full" />
              {address}
            </div>

            <h3 className="font-semibold">Balances</h3>
            <div className="grid grid-cols-2 text-sm gap-x-2 w-72">
              <h4 className="font-medium ">Ethereum</h4>{" "}
              <span className="font-semibold font-mono">
                : {getETHBalance(provider, address)} ETH
              </span>
            </div>

            <div className="grid grid-cols-2 text-sm gap-x-2  w-72">
              <h4 className="font-medium ">Wrapped Ethereum</h4>{" "}
              <span className="font-semibold font-mono">
                : {getWETHBalance(provider, address)} WETH
              </span>
            </div>

            <Button className="mt-6" variant="secondary" onClick={disconnect}>
              Disconnect <Power />
            </Button>
          </DialogContent>
        </Dialog>
      ) : (
        <Button onClick={connect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </nav>
  );
}
