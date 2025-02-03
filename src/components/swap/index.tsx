import useBalances from "@/hooks/useBalances";
import { ethers } from "ethers";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  COMMON_ERC20_ABI,
  ETH_CHAINID,
  WETH_CONTRACT_ADDRESS,
  WETH_TOKEN_NAME,
  WETH_TOKEN_SYMBOL,
} from "@/constants";
import type { SwapSummaryConfig, TokenDetails } from "@/types";
import SwapSummary from "./swap-summary";
import { executeSwap, getQuote } from "@/utils/quote";
import { Token } from "@uniswap/sdk-core";
import { estimateGasCostInToken } from "@/utils/calculations";
import BalanceInfo from "./balance-info";

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
  const { wEthBalance, refetchBalances } = useBalances({ address, provider });
  const [error, setError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erc20TokenAddress, setERC20TokenAddress] = useState("");
  const [wEthValueToSwap, setEthValueToSwap] = useState("0");
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | undefined>();
  const [isFetchingQuoteInformation, setIsFetchingQuoteInformation] =
    useState(false);
  const [swapSummary, setSwapSummary] = useState<
    SwapSummaryConfig | undefined
  >();

  async function handleERC20TokenAddressChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setError(undefined);
    setERC20TokenAddress(e.target.value);
  }

  function handleEthValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (Number(value) > Number(wEthBalance)) {
      setError("Insufficient WETH balance");
      return;
    }
    setError(undefined);
    setEthValueToSwap(value);
  }

  async function handleGetQuote() {
    if (!ethers.isAddress(erc20TokenAddress)) {
      setError("Invalid Ethereum address format!");

      return;
    }

    const code = await provider.getCode(erc20TokenAddress);

    if (code === "0x") {
      setError("ERC20 token not found!");
      return;
    }

    try {
      setIsFetchingQuoteInformation(true);

      const contractDetails = new ethers.Contract(
        erc20TokenAddress,
        COMMON_ERC20_ABI,
        provider
      );

      const tokenName = await contractDetails.name();
      const tokenSymbol = await contractDetails.symbol();
      const tokenDecimals = Number((await contractDetails.decimals()) || "0");

      setTokenDetails({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
      });
      setError(undefined);

      const tokenA = new Token(
        ETH_CHAINID,
        WETH_CONTRACT_ADDRESS,
        18,
        WETH_TOKEN_SYMBOL,
        WETH_TOKEN_NAME
      );

      const tokenB = new Token(
        ETH_CHAINID,
        erc20TokenAddress,
        tokenDecimals,
        tokenSymbol,
        tokenName
      );

      const { executionPrice, minimumAmountOut, outputAmount, priceImpact } =
        await getQuote({
          amountIn: wEthValueToSwap,
          provider,
          tokenA,
          tokenB,
        });

      const swapRate = executionPrice;

      const gasCost = await estimateGasCostInToken(provider, swapRate);

      setSwapSummary({
        swapRate,
        gasCost,
        finalAmount: outputAmount,
        minimumAmountOut,
        priceImpact,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingQuoteInformation(false);
    }
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

    try {
      const contractDetails = new ethers.Contract(
        erc20TokenAddress,
        COMMON_ERC20_ABI,
        provider
      );

      const tokenName = await contractDetails.name();
      const tokenSymbol = await contractDetails.symbol();
      const tokenDecimals = Number((await contractDetails.decimals()) || "0");

      setTokenDetails({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
      });
      setLoading(true);
      setError(undefined);

      const tokenA = new Token(
        ETH_CHAINID,
        WETH_CONTRACT_ADDRESS,
        18,
        WETH_TOKEN_SYMBOL,
        WETH_TOKEN_NAME
      );

      const tokenB = new Token(
        ETH_CHAINID,
        erc20TokenAddress,
        tokenDecimals,
        tokenSymbol,
        tokenName
      );
      await executeSwap({
        amountIn: wEthValueToSwap,
        provider,
        tokenA,
        tokenB,
      });
      setIsSuccess(true);
      resetForm();
      refetchBalances();
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch {
      setError("Traction failed, Please try again!");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setERC20TokenAddress("");
    setEthValueToSwap("");
    setTokenDetails(undefined);
    setSwapSummary(undefined);
    const ethAmountInput = document.getElementById(
      "wEthAmount"
    ) as HTMLInputElement;
    const erc20TokenAddressInput = document.getElementById(
      "erc20TokenAddress"
    ) as HTMLInputElement;

    if (ethAmountInput) {
      ethAmountInput.value = "";
    }
    if (erc20TokenAddressInput) {
      erc20TokenAddressInput.value = "";
    }
  }

  return (
    <div className="my-10 space-y-8">
      <form
        className="space-y-5 p-4 border rounded-lg shadow-md mt-10"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <Label htmlFor="erc20TokenAddress">WETH Amount</Label>
          <Input
            id="wEthAmount"
            name="wETHAmount"
            placeholder="0"
            type="number"
            onInput={handleEthValueChange}
            disabled={
              isFetchingQuoteInformation ||
              loading ||
              Boolean(swapSummary && tokenDetails)
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="erc20TokenAddress">ERC 20 Token Address</Label>
          <Input
            id="erc20TokenAddress"
            name="erc20TokenAddress"
            placeholder="0x0000000000000000000000000000000000000000"
            onInput={handleERC20TokenAddressChange}
            disabled={
              isFetchingQuoteInformation ||
              loading ||
              Boolean(swapSummary && tokenDetails)
            }
            required
          />
        </div>
        {swapSummary && tokenDetails ? (
          <SwapSummary
            tokenDetails={tokenDetails}
            swapSummary={swapSummary}
            isFetchingQuoteInformation={isFetchingQuoteInformation}
          />
        ) : null}
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
        {swapSummary && tokenDetails ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSwap}
              className="w-full"
              disabled={
                !Number(wEthValueToSwap) || !erc20TokenAddress || loading
              }
            >
              {loading ? "Swaping..." : "Swap"}
            </Button>
            <Button onClick={resetForm} className="w-full" variant="secondary">
              Reset
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleGetQuote}
            className="w-full"
            disabled={
              !Number(wEthValueToSwap) ||
              !erc20TokenAddress ||
              isFetchingQuoteInformation
            }
          >
            {isFetchingQuoteInformation ? "Getting Quote..." : "Get Quote"}
          </Button>
        )}
      </form>
      <BalanceInfo setActiveTab={setActiveTab} wEthBalance={wEthBalance} />
    </div>
  );
}
