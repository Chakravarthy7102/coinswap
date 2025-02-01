import useBalances from "@/hooks/useBalances";
import { ethers } from "ethers";
import { AlertCircle, Info, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type SwapDialogProps = {
  provider: ethers.BrowserProvider;
  address: string;
  setActiveTab: (value: string) => void;
};

export default function Swap({
  address,
  provider,
  setActiveTab,
}: SwapDialogProps) {
  const { wEthBalance } = useBalances({ address, provider });

  const [error, setError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estimatedGasCost, setEstimatedGasCost] = useState("0");
  const [erc20TokenAddress, setERC20TokenAddress] = useState("");

  async function handleERC20TokenAddressChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setError(undefined);
    setERC20TokenAddress(e.target.value);
  }

  async function handleSwap() {
    if (!ethers.isAddress(erc20TokenAddress)) {
      setError("Invalid Ethereum address format!");
      return;
    }

    const code = await provider.getCode(erc20TokenAddress);

    if (code === "0x") {
      setError("ERC20 token not found!");
      return;
    }
    setLoading(true);
    setError(undefined);
  }

  return (
    <div className="mt-10 space-y-8">
      <div className="p-4 border rounded-lg shadow-md mt-10 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="erc20TokenAddress">ERC 20 Token Address</Label>
          <Input
            id="erc20TokenAddress"
            name="erc20TokenAddress"
            placeholder="0x0000000000000000000000000000000000000000"
            onInput={handleERC20TokenAddressChange}
          />
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {isSuccess ? (
          <Alert variant="success">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your tranaction was successful</AlertDescription>
          </Alert>
        ) : null}
        <p className="mt-2 text-xs flex items-center">
          <Info className="size-4 text-primary mr-2" /> Estimated Gas:{" "}
          {estimatedGasCost} ETH
        </p>
        <Button
          onClick={handleSwap}
          className="w-full"
          disabled={loading || !erc20TokenAddress}
        >
          {loading ? "Swaping..." : "Swap"}
        </Button>
      </div>
      <Alert variant="default">
        <AlertTitle className="mt-1.5">Balances Info</AlertTitle>
        <AlertDescription className="space-y-5 mt-3">
          <div className="grid grid-cols-2 text-sm gap-x-2 w-72">
            <h4 className="font-medium ">Wrapped Ethereum</h4>{" "}
            <span className="font-semibold font-mono">
              : {wEthBalance} WETH
            </span>
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
    </div>
  );
}
