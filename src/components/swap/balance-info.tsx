import React from "react";

import { InfoIcon, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type BalanceInfoProps = {
  wEthBalance: string;
  setActiveTab: (tab: string) => void;
};
export default function BalanceInfo({
  setActiveTab,
  wEthBalance,
}: BalanceInfoProps) {
  return (
    <Alert variant="default">
      <InfoIcon className="size-4" />
      <AlertTitle className="mt-1.5 flex items-center gap-1">
        Balances Info
      </AlertTitle>
      <AlertDescription className="space-y-5 mt-3">
        <div className="grid grid-cols-2 text-sm gap-x-2 w-72">
          <h4 className="font-medium ">Wrapped Ethereum</h4>{" "}
          <span className="font-semibold font-mono">: {wEthBalance} WETH</span>
        </div>
        <Button
          onClick={() => setActiveTab("wrap_eth")}
          className="w-full"
          variant="outline"
          size="sm"
        >
          <Plus />
          Add WETH
        </Button>
      </AlertDescription>
    </Alert>
  );
}
