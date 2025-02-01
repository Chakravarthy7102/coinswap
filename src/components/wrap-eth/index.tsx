import { useState } from "react";
import { ethers } from "ethers";
import { WETH_ABI, WETH_CONTRACT_ADDRESS } from "@/constants";
import useBalances from "@/hooks/useBalances";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

type WrapETHProps = {
  provider: ethers.BrowserProvider;
  address: string;
};

export default function WrapETH({ address, provider }: WrapETHProps) {
  const [estimatedGasCost, setEstimatedGasCost] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);

  const [ethValueToWrap, setEthValueToWrap] = useState("0");

  const { wEthBalance, ethBalance, refetchBalances } = useBalances({
    address,
    provider,
  });

  function handleEthValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (Number(value) > Number(ethBalance)) {
      setError("Insufficient ETH balance");
      return;
    }

    setEthValueToWrap(value);
    fetchGasEstimation(value);
  }

  async function fetchGasEstimation(value: string) {
    try {
      setError(undefined);

      if (!value || Number(value) <= 0) {
        setEstimatedGasCost("0");
        return;
      }

      const wethContract = new ethers.Contract(
        WETH_CONTRACT_ADDRESS,
        WETH_ABI,
        provider
      );

      const gasEstimate = await wethContract.deposit.estimateGas({
        value: ethers.parseEther(value),
      });

      const feeData = await provider.getFeeData();

      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || BigInt(0);
      const maxFeePerGas =
        feeData.maxFeePerGas || feeData.gasPrice || BigInt(0);

      const effectiveGasPrice =
        maxFeePerGas > maxPriorityFeePerGas
          ? maxFeePerGas
          : maxPriorityFeePerGas;

      const gasCostWei = gasEstimate * effectiveGasPrice;
      const gasCostEth = Number(ethers.formatEther(gasCostWei)).toFixed(8);

      setEstimatedGasCost(gasCostEth);
    } catch (err) {
      console.error("Error estimating gas:", err);
      setError("Failed to estimate gas cost");
      setEstimatedGasCost("0");
    }
  }

  async function handleWrapETH() {
    setLoading(true);
    setError(undefined);

    try {
      const signer = await provider.getSigner();
      const wethContract = new ethers.Contract(
        WETH_CONTRACT_ADDRESS,
        WETH_ABI,
        signer
      );
      const tx = await wethContract.deposit({
        value: ethers.parseEther(ethValueToWrap),
      });
      await tx.wait();
      refetchBalances();

      setIsSuccess(true);
      setEthValueToWrap("0");
      setEstimatedGasCost("0");
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      console.log(err);
      setError("Traction failed, Please try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded-lg shadow-md mt-10 space-y-5 ">
      <h2 className="text-xl font-bold mb-2">ETH to WETH</h2>
      <div className="space-y-2">
        <div className="grid grid-cols-2 text-sm gap-x-2 w-72">
          <h4 className="font-medium ">Ethereum</h4>{" "}
          <span className="font-semibold font-mono">: {ethBalance} ETH</span>
        </div>
        <div className="grid grid-cols-2 text-sm gap-x-2  w-72">
          <h4 className="font-medium ">Wrapped Ethereum</h4>{" "}
          <span className="font-semibold font-mono">: {wEthBalance} WETH</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ethValue">Enter ETH value to wrap</Label>
        <Input
          id="ethValue"
          name="ethValue"
          placeholder="0.1"
          type="number"
          value={ethValueToWrap}
          onInput={handleEthValueChange}
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
        className="w-full"
        onClick={handleWrapETH}
        disabled={loading || !Number(ethValueToWrap)}
      >
        {loading ? "Wrapping..." : "Wrap"}
      </Button>
    </div>
  );
}
