import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gem, Power } from "lucide-react";
import { truncateAddress } from "@/utils/format";
import { ethers } from "ethers";
import useBalances from "@/hooks/useBalances";

type AccountDetailsDialogProps = {
  provider: ethers.BrowserProvider;
  address: string;
  disconnect: () => Promise<void>;
};

export default function AccountDetailsDialog({
  address,
  disconnect,
  provider,
}: AccountDetailsDialogProps) {
  const { ethBalance, wEthBalance } = useBalances({ address, provider });
  return (
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
          <span className="font-semibold font-mono">: {ethBalance} ETH</span>
        </div>

        <div className="grid grid-cols-2 text-sm gap-x-2  w-72">
          <h4 className="font-medium ">Wrapped Ethereum</h4>{" "}
          <span className="font-semibold font-mono">: {wEthBalance} WETH</span>
        </div>

        <Button className="mt-6" variant="secondary" onClick={disconnect}>
          Disconnect <Power />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
